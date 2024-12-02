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
		username := ""
		if v, ok := userData["username"].(string); ok && v != "" {
			username = v
		}
		isIn := "入室"
		if !inoutReq.IsIn {
			isIn = "退室"
		}
		msg := fmt.Sprintf("%sが%sしたよ", username, isIn)
		log.Println(msg)
		lib.SendMessageToDiscord(lib.GetDiscordChannelID(), msg)
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
