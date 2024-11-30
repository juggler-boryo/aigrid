package handlers

import (
	"aigrid/server/lib"
	"encoding/json"
	"fmt"
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

type TamakiEvent struct {
	ID           string    `json:"id" firestore:"id"`
	Kind         int       `json:"kind" firestore:"kind"`
	OrganizerUID string    `json:"organizer_uid" firestore:"organizer_uid"`
	CreatedAt    time.Time `json:"created_at" firestore:"created_at"`
}

type TamakiEvent1 struct {
	TamakiEvent
	ParticipantsUIDs []string `json:"participants_uids" firestore:"participants_uids"`
	Memo             string   `json:"memo,omitempty" firestore:"memo,omitempty"`
}

func GetTamakiHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	doc, err := lib.DB.Collection("tamaki_events").Doc(id).Get(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// First get base event to check kind
	var baseEvent TamakiEvent
	if err := doc.DataTo(&baseEvent); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	switch baseEvent.Kind {
	case 1:
		var event TamakiEvent1
		if err := doc.DataTo(&event); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(event)
	default:
		http.Error(w, fmt.Sprintf("Unknown event kind: %d", baseEvent.Kind), http.StatusBadRequest)
	}
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
		TamakiEvent: TamakiEvent{
			ID:           id,
			Kind:         dto.Kind,
			OrganizerUID: userID,
			CreatedAt:    time.Now(),
		},
		ParticipantsUIDs: dto.ParticipantsUIDs,
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
	len := 3
	iter := lib.DB.Collection("tamaki_events").OrderBy("created_at", firestore.Desc).Limit(len).Documents(r.Context())
	docs, err := iter.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var tamakiEvents []interface{}
	for _, doc := range docs {
		var baseEvent TamakiEvent
		if err := doc.DataTo(&baseEvent); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		switch baseEvent.Kind {
		case 1:
			var event TamakiEvent1
			if err := doc.DataTo(&event); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			tamakiEvents = append(tamakiEvents, event)
		default:
			tamakiEvents = append(tamakiEvents, baseEvent)
		}
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
