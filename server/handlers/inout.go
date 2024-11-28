package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"aigrid/server/lib"

	"github.com/gorilla/mux"
)

// InoutRequest represents the expected request body for the inout endpoint.
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

	// Firestoreに入退室記録を保存する
	if err := lib.RecordInout(uid, inoutReq.IsIn); err != nil {
		http.Error(w, "入退室記録の保存に失敗しました", http.StatusInternalServerError)
		return
	}

	// Discordに通知する
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
