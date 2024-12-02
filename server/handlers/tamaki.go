package handlers

import (
	"aigrid/server/lib"
	"aigrid/server/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func handleTamakiEvent[T any](doc *firestore.DocumentSnapshot, w http.ResponseWriter) error {
	var event T
	if err := doc.DataTo(&event); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(event)
}

func GetTamakiHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	doc, err := lib.DB.Collection("tamaki_events").Doc(id).Get(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	var baseEvent models.TamakiEvent
	if err := doc.DataTo(&baseEvent); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	switch baseEvent.Kind {
	case 0:
		handleTamakiEvent[models.TamakiEvent0](doc, w)
	case 1:
		handleTamakiEvent[models.TamakiEvent1](doc, w)
	default:
		http.Error(w, fmt.Sprintf("Unknown event kind: %d", baseEvent.Kind), http.StatusBadRequest)
	}
}

func createTamakiEvent[T any](dto T, id string, w http.ResponseWriter, r *http.Request) {
	_, err := lib.DB.Collection("tamaki_events").Doc(id).Set(r.Context(), dto)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dto)
}

func CreateTamakiHandler(w http.ResponseWriter, r *http.Request) {
	var baseDTO models.TamakiEventDTO
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := json.Unmarshal(body, &baseDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("uid").(string)
	id := uuid.New().String()
	createdAt := time.Now()

	switch baseDTO.Kind {
	case 0:
		var dto models.TamakiEvent0DTO
		if err := json.Unmarshal(body, &dto); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		tamakiEvent := models.TamakiEvent0{
			TamakiEvent: models.TamakiEvent{
				ID:           id,
				Kind:         dto.Kind,
				OrganizerUID: userID,
				CreatedAt:    createdAt,
			},
			ParticipantsUIDs: dto.ParticipantsUIDs,
			Title:            dto.Title,
			Memo:             dto.Memo,
			Price:            dto.Price,
		}
		createTamakiEvent(tamakiEvent, id, w, r)

		priceText := "未定"
		if dto.Price > 0 {
			priceText = fmt.Sprintf("%d円", dto.Price)
		}
		// najdorFourierの提案により、2ch風にURLを表示する。hはスパムっぽいので意図的に抜くとする
		url := fmt.Sprintf("ttps://aigrid.vercel.app/tamaki/%s", id)

		message := fmt.Sprintf("わくわくイベント発生\nLタイトル: %s\nLメモ: %s\nL値段: %s\nLURL: %s", dto.Title, dto.Memo, priceText, url)
		channelID := lib.GetDiscordChannelID()
		if err := lib.SendMessageToDiscord(channelID, message); err != nil {
			fmt.Printf("Failed to send Discord notification: %v\n", err)
		}

	case 1:
		var dto models.TamakiEvent1DTO
		if err := json.Unmarshal(body, &dto); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		tamakiEvent := models.TamakiEvent1{
			TamakiEvent: models.TamakiEvent{
				ID:           id,
				Kind:         dto.Kind,
				OrganizerUID: userID,
				CreatedAt:    createdAt,
			},
			ParticipantsUIDs: dto.ParticipantsUIDs,
			Memo:             dto.Memo,
		}
		createTamakiEvent(tamakiEvent, id, w, r)

	default:
		http.Error(w, "Unsupported event kind", http.StatusBadRequest)
	}
}

func updateTamakiEvent[T any](doc *firestore.DocumentSnapshot, dto T, userID string, id string, w http.ResponseWriter, r *http.Request) error {
	var existingEvent T
	if err := doc.DataTo(&existingEvent); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}

	_, err := lib.DB.Collection("tamaki_events").Doc(id).Set(r.Context(), dto)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(dto)
}

func UpdateTamakiHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	doc, err := lib.DB.Collection("tamaki_events").Doc(id).Get(r.Context())
	if err != nil {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}

	var baseEvent models.TamakiEvent
	if err := doc.DataTo(&baseEvent); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	userID := r.Context().Value("uid").(string)

	switch baseEvent.Kind {
	case 0:
		var dto models.TamakiEvent0DTO
		if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if dto.Kind != 0 {
			http.Error(w, "Invalid event kind", http.StatusBadRequest)
			return
		}

		var existingEvent models.TamakiEvent0
		if err := doc.DataTo(&existingEvent); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		existingEvent.ParticipantsUIDs = dto.ParticipantsUIDs
		existingEvent.Title = dto.Title
		existingEvent.Memo = dto.Memo
		existingEvent.Price = dto.Price

		updateTamakiEvent(doc, existingEvent, userID, id, w, r)

	case 1:
		var dto models.TamakiEvent1DTO
		if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if dto.Kind != 1 {
			http.Error(w, "Invalid event kind", http.StatusBadRequest)
			return
		}

		var existingEvent models.TamakiEvent1
		if err := doc.DataTo(&existingEvent); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		existingEvent.ParticipantsUIDs = dto.ParticipantsUIDs
		existingEvent.Memo = dto.Memo

		updateTamakiEvent(doc, existingEvent, userID, id, w, r)

	default:
		http.Error(w, "Unsupported event kind", http.StatusBadRequest)
	}
}

func ListTamakiHandler(w http.ResponseWriter, r *http.Request) {
	size := 3
	if sizeStr := r.URL.Query().Get("size"); sizeStr != "" {
		if s, err := strconv.Atoi(sizeStr); err == nil && s > 0 {
			size = s
		}
	}

	cursor := r.URL.Query().Get("cursor")
	kindStr := r.URL.Query().Get("kind")

	query := lib.DB.Collection("tamaki_events").
		OrderBy("created_at", firestore.Desc)

	if kindStr != "" {
		kind, err := strconv.Atoi(kindStr)
		if err != nil {
			http.Error(w, "Invalid kind parameter", http.StatusBadRequest)
			return
		}
		query = query.Where("kind", "==", kind)
	}

	query = query.Limit(size + 1)

	if cursor != "" {
		cursorDoc, err := lib.DB.Collection("tamaki_events").Doc(cursor).Get(r.Context())
		if err != nil {
			http.Error(w, "Invalid cursor", http.StatusBadRequest)
			return
		}
		query = query.StartAfter(cursorDoc)
	}

	docs, err := query.Documents(r.Context()).GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	hasMore := false
	if len(docs) > size {
		hasMore = true
		docs = docs[:size]
	}

	var tamakiEvents []interface{}
	var lastID string
	for _, doc := range docs {
		lastID = doc.Ref.ID
		var baseEvent models.TamakiEvent
		if err := doc.DataTo(&baseEvent); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		switch baseEvent.Kind {
		case 0:
			var event models.TamakiEvent0
			if err := doc.DataTo(&event); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			tamakiEvents = append(tamakiEvents, event)
		case 1:
			var event models.TamakiEvent1
			if err := doc.DataTo(&event); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			tamakiEvents = append(tamakiEvents, event)
		default:
			tamakiEvents = append(tamakiEvents, baseEvent)
		}
	}

	response := struct {
		Events     []interface{} `json:"events"`
		NextCursor string        `json:"next_cursor,omitempty"`
		HasMore    bool          `json:"has_more"`
	}{
		Events:  tamakiEvents,
		HasMore: hasMore,
	}

	if hasMore {
		response.NextCursor = lastID
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func DeleteTamakiHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := lib.DB.Collection("tamaki_events").Doc(id).Delete(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
