package handlers

import (
	"encoding/json"
	"net/http"

	"aigrid/server/lib"

	"github.com/gorilla/mux"
)

// InoutRequest represents the expected request body for the inout endpoint.
type InoutRequest struct {
	IsIn bool `json:"isIn"`
}

// PostInoutHandler handles recording entry and exit actions to Firestore.
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

	// Record the inout action to Firestore
	if err := lib.RecordInout(uid, inoutReq.IsIn); err != nil {
		http.Error(w, "Failed to record inout action", http.StatusInternalServerError)
		return
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
