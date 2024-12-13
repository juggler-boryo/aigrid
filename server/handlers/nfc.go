package handlers

import (
	"aigrid/server/lib"
	"aigrid/server/models"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func GetUserBySuicaIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	suicaID := vars["suica_id"]
	if suicaID == "" {
		http.Error(w, "suica_id is required", http.StatusBadRequest)
		return
	}

	user, err := lib.GetUserBySuicaID(suicaID)
	if err != nil {
		http.Error(w, "Failed to get user data, "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("user: ", user)
	uid, ok := user["uid"].(string)
	if !ok {
		http.Error(w, "Failed to get uid", http.StatusInternalServerError)
		return
	}

	// get inout history
	history, err := lib.GetInoutHistory(uid, 1)
	if err != nil {
		http.Error(w, "Failed to get inout history, "+err.Error(), http.StatusInternalServerError)
		return
	}

	// pack to nfc dto

	username, ok := user["username"].(string)
	if !ok {
		http.Error(w, "Failed to get username", http.StatusInternalServerError)
		return
	}

	nfcDTO := models.NFCDTO{
		UID:      uid,
		Username: username,
		SuicaID:  suicaID,
		IsIn:     history[0].IsIn,
	}

	json.NewEncoder(w).Encode(nfcDTO)
}
