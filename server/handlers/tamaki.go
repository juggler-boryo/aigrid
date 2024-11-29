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
	ID               string    `json:"id" firestore:"id"`
	Kind             int       `json:"kind" firestore:"kind"`
	OrganizerUID     string    `json:"organizer_uid" firestore:"organizer_uid"`
	ParticipantsUIDs []string  `json:"participants_uids" firestore:"participants_uids"`
	CreatedAt        time.Time `json:"created_at" firestore:"created_at"`
	Memo             string    `json:"memo,omitempty" firestore:"memo,omitempty"`
}

func GetTamakiHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	doc, err := lib.DB.Collection("tamaki_events").Doc(id).Get(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	var tamakiEvent TamakiEvent1
	if err := doc.DataTo(&tamakiEvent); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tamakiEvent)
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
	id := uuid.New().String()

	tamakiEvent := TamakiEvent1{
		ID:               id,
		Kind:             dto.Kind,
		OrganizerUID:     userID,
		ParticipantsUIDs: dto.ParticipantsUIDs,
		CreatedAt:        time.Now(),
		Memo:             dto.Memo,
	}

	_, err := lib.DB.Collection("tamaki_events").Doc(id).Set(r.Context(), tamakiEvent)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tamakiEvent)
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
	iter := lib.DB.Collection("tamaki_events").OrderBy("created_at", firestore.Desc).Limit(5).Documents(r.Context())
	docs, err := iter.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var tamakiEvents []TamakiEvent1
	for _, doc := range docs {
		var tamakiEvent TamakiEvent1
		if err := doc.DataTo(&tamakiEvent); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		tamakiEvents = append(tamakiEvents, tamakiEvent)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tamakiEvents)
}

func DeleteTamakiHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := lib.DB.Collection("tamaki_events").Doc(id).Delete(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
