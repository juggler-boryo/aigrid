package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"aigrid/server/lib"

	"github.com/gorilla/mux"
)

type InoutRequest struct {
	IsIn bool `json:"isIn"`
}

func PostInoutHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	uid := vars["uid"]
	if uid == "" {
		http.Error(w, "uid is required", http.StatusBadRequest)
		return
	}

	var inoutReq InoutRequest
	if err := json.NewDecoder(r.Body).Decode(&inoutReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	history, err := lib.GetInoutHistory(uid, 1)
	if err != nil {
		http.Error(w, "入退室履歴の取得に失敗しました", http.StatusInternalServerError)
		return
	}

	if len(history) > 0 {
		lastRecord := history[0]
		if lastRecord.IsIn == inoutReq.IsIn {
			msg := "既に入室しています"
			if !inoutReq.IsIn {
				msg = "既に退室しています"
			}
			http.Error(w, msg, http.StatusBadRequest)
			return
		}
	}
	if err := lib.UpdateRealtimeDBInout(uid, inoutReq.IsIn); err != nil {
		log.Printf("Failed to update realtime DB: %v", err)
		http.Error(w, "Failed to update realtime DB", http.StatusInternalServerError)
		return
	}

	if err := lib.RecordInout(uid, inoutReq.IsIn); err != nil {
		http.Error(w, "入退室記録の保存に失敗しました", http.StatusInternalServerError)
		return
	}

	userData, exists, err := lib.GetUser(uid)
	if err != nil {
		http.Error(w, "Failed to get user data", http.StatusInternalServerError)
		return
	}
	if exists {
		username := userData["username"].(string)
		var msg string
		if inoutReq.IsIn {
			greetText, ok := userData["greet_text"].(string)
			if ok && greetText != "" {
				msg = fmt.Sprintf("%s 🟢 %s", username, greetText)
			} else {
				msg = fmt.Sprintf("%s✋ 🟢 入室したよ", username)
			}
		} else {
			byeText, ok := userData["bye_text"].(string)
			if ok && byeText != "" {
				msg = fmt.Sprintf("%s 🟥 %s", username, byeText)
			} else {
				msg = fmt.Sprintf("%s✋ 🟥 退室したよ", username)
			}
		}
		log.Println(msg)
		lib.SendMessageToDiscord(lib.GetDiscordChannelID(), msg)
	}

	w.WriteHeader(http.StatusOK)
}

func AddHoursHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	uid := vars["uid"]
	if uid == "" {
		http.Error(w, "uid is required", http.StatusBadRequest)
		return
	}

	hours := vars["hours"]
	if hours == "" {
		http.Error(w, "hours is required", http.StatusBadRequest)
		return
	}

	history, err := lib.GetInoutHistory(uid, 1)
	if err != nil {
		http.Error(w, "Failed to get inout history", http.StatusInternalServerError)
		return
	}

	if len(history) == 0 {
		http.Error(w, "No inout history found", http.StatusBadRequest)
		return
	}

	if !history[0].IsIn {
		http.Error(w, "Already out", http.StatusBadRequest)
		return
	}

	latestRecord := history[0]
	hoursInt, err := strconv.Atoi(hours)
	if err != nil {
		http.Error(w, "Invalid hours parameter", http.StatusBadRequest)
		return
	}
	if latestRecord.IsIn {
		latestRecord.CreatedAt = latestRecord.CreatedAt.Add(-time.Duration(hoursInt) * time.Hour)
	}

	if err := lib.UpdateInout(latestRecord); err != nil {
		http.Error(w, "Failed to update inout", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func PostExitAllHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	executingUID := vars["uid"]

	userData, exists, err := lib.GetUser(executingUID)
	if err != nil {
		http.Error(w, "ユーザーデータの取得に失敗しました", http.StatusInternalServerError)
		return
	}

	if !exists {
		http.Error(w, "ユーザーが存在しません", http.StatusNotFound)
		return
	}

	userIDs, err := lib.ListUsers()
	if err != nil {
		http.Error(w, "ユーザー一覧の取得に失敗しました", http.StatusInternalServerError)
		return
	}

	for _, targetUID := range userIDs {
		isIn, err := lib.GetIsIn(targetUID)
		if err != nil {
			log.Printf("ユーザー %s の状態取得に失敗しました: %v", targetUID, err)
			continue
		}
		if !isIn {
			continue
		}

		err = lib.RecordInout(targetUID, false)
		if err != nil {
			log.Printf("ユーザー %s の退室記録に失敗しました: %v", targetUID, err)
			continue
		}

		err = lib.UpdateRealtimeDBInout(targetUID, false)
		if err != nil {
			log.Printf("リアルタイムDBの更新に失敗しました: %v", err)
			continue
		}
	}

	username := ""
	if v, ok := userData["username"].(string); ok && v != "" {
		username = v
	}
	msg := username + "が爆発しました🎆"
	err = lib.SendMessageToDiscord(lib.GetDiscordChannelID(), msg)
	if err != nil {
		log.Printf("Discordへのメッセージ送信に失敗しました: %v", err)
	}

	w.WriteHeader(http.StatusOK)
}

func GetInMinutesHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	uid := vars["uid"]
	if uid == "" {
		http.Error(w, "uid is required", http.StatusBadRequest)
		return
	}

	minutes, err := lib.GetUserInMinutes(uid)
	if err != nil {
		http.Error(w, "Failed to get in minutes: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"minutes": minutes,
	})
}

func GetInoutHistoryHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	uid := vars["uid"]
	if uid == "" {
		http.Error(w, "uid is required", http.StatusBadRequest)
		return
	}

	len := 10
	history, err := lib.GetInoutHistory(uid, len)
	if err != nil {
		http.Error(w, "Failed to get inout history: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"history": history,
	})
}

func GetInoutHistoryByMonthHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	uid := vars["uid"]
	if uid == "" {
		http.Error(w, "uid is required", http.StatusBadRequest)
		return
	}

	history, err := lib.GetInoutHistoryByMonthByUID(uid)
	if err != nil {
		http.Error(w, "Failed to get inout history: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"history": history,
	})
}

func GetIsInHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	uid := vars["uid"]
	if uid == "" {
		http.Error(w, "uid is required", http.StatusBadRequest)
		return
	}

	isIn, err := lib.GetIsIn(uid)
	if err != nil {
		http.Error(w, "Failed to get is in: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"isIn": isIn,
	})
}

func GetInoutAnalyticsHandler(w http.ResponseWriter, r *http.Request) {
	// Get date range parameters from query
	fromYearStr := r.URL.Query().Get("from_year")
	fromMonthStr := r.URL.Query().Get("from_month")
	toYearStr := r.URL.Query().Get("to_year")
	toMonthStr := r.URL.Query().Get("to_month")

	if fromYearStr == "" || fromMonthStr == "" || toYearStr == "" || toMonthStr == "" {
		http.Error(w, "from_year, from_month, to_year, and to_month parameters are required", http.StatusBadRequest)
		return
	}

	fromYear, err := strconv.Atoi(fromYearStr)
	if err != nil {
		http.Error(w, "Invalid from_year parameter", http.StatusBadRequest)
		return
	}

	fromMonth, err := strconv.Atoi(fromMonthStr)
	if err != nil || fromMonth < 1 || fromMonth > 12 {
		http.Error(w, "Invalid from_month parameter", http.StatusBadRequest)
		return
	}

	toYear, err := strconv.Atoi(toYearStr)
	if err != nil {
		http.Error(w, "Invalid to_year parameter", http.StatusBadRequest)
		return
	}

	toMonth, err := strconv.Atoi(toMonthStr)
	if err != nil || toMonth < 1 || toMonth > 12 {
		http.Error(w, "Invalid to_month parameter", http.StatusBadRequest)
		return
	}

	// Calculate start and end of the date range
	startDate := time.Date(fromYear, time.Month(fromMonth), 1, 0, 0, 0, 0, time.Local)
	endDate := time.Date(toYear, time.Month(toMonth), 1, 0, 0, 0, 0, time.Local).AddDate(0, 1, -1).Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	history, err := lib.GetInoutHistoryByDateRange(startDate, endDate)
	if err != nil {
		http.Error(w, "Failed to get inout history: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"history": history,
	})
}
