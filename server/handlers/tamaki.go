package handlers

import (
	"aigrid/server/lib"
	"encoding/json"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type TamakiEvent1DTO struct {
	Kind             int      `json:"kind"`
	ParticipantsUIDs []string `json:"participants_uids"`
	Memo             string   `json:"memo,omitempty"`
}

type TamakiEvent1 struct {
	ID               string    `json:"id"`
	Kind             int       `json:"kind"`
	OrganizerUID     string    `json:"organizer_uid"`
	ParticipantsUIDs []string  `json:"participants_uids"`
	CreatedAt        time.Time `json:"created_at"`
	Memo             string    `json:"memo,omitempty"`
}

func CreateTamakiHandler(w http.ResponseWriter, r *http.Request) {
	var dto TamakiEvent1DTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if dto.Kind != 1 {
		http.Error(w, "Invalid event kind", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("uid").(string)

	tamaki_event := TamakiEvent1{
		ID:               uuid.New().String(),
		Kind:             dto.Kind,
		OrganizerUID:     userID,
		ParticipantsUIDs: dto.ParticipantsUIDs,
		CreatedAt:        time.Now(),
		Memo:             dto.Memo,
	}

	_, err := lib.DB.Collection("tamaki_events").Doc(tamaki_event.ID).Set(r.Context(), tamaki_event)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tamaki_event)
}

func UpdateTamakiHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var dto TamakiEvent1DTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if dto.Kind != 1 {
		http.Error(w, "Invalid event kind", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("uid").(string)

	doc, err := lib.DB.Collection("tamaki_events").Doc(id).Get(r.Context())
	if err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	var existingEvent TamakiEvent1
	if err := doc.DataTo(&existingEvent); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if existingEvent.OrganizerUID != userID {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	existingEvent.ParticipantsUIDs = dto.ParticipantsUIDs
	existingEvent.Memo = dto.Memo

	_, err = lib.DB.Collection("tamaki_events").Doc(id).Set(r.Context(), existingEvent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingEvent)
}

func ListTamakiHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("uid").(string)

	iter := lib.DB.Collection("tamaki_events").OrderBy("created_at", firestore.Desc).Documents(r.Context())
	docs, err := iter.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var events []TamakiEvent1
	for _, doc := range docs {
		var event TamakiEvent1
		if err := doc.DataTo(&event); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if event.OrganizerUID == userID || contains(event.ParticipantsUIDs, userID) {
			events = append(events, event)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func DeleteTamakiHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	lib.DB.Collection("tamaki_events").Doc(id).Delete(r.Context())
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
