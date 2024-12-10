package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

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
			if userData["greet_text"] != "" {
				msg = fmt.Sprintf("%s 🟢 %s", username, userData["greet_text"].(string))
			} else {
				msg = fmt.Sprintf("%s✋ 🟢 入室したよ", username)
			}
		} else {
			if userData["bye_text"] != "" {
				msg = fmt.Sprintf("%s 🟥 %s", username, userData["bye_text"].(string))
			} else {
				msg = fmt.Sprintf("%s✋ 🟥 退室したよ", username)
			}
		}
		log.Println(msg)
		lib.SendMessageToDiscord(lib.GetDiscordChannelID(), msg)
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
	history, err := lib.GetInoutHistoryByMonth()
	if err != nil {
		http.Error(w, "Failed to get inout history: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"history": history,
	})
}
