package handlers

import (
	"aigrid/server/lib"
	"aigrid/server/models"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func ListUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := lib.ListUsers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func GetUserByUIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	uid := vars["uid"]
	if uid == "" {
		http.Error(w, "uid is required", http.StatusBadRequest)
		return
	}

	userData, exists, err := lib.GetUser(uid)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if !exists {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	// TODO: ゴミ
	user := models.User{
		Uid: uid,
		Username: func() string {
			if v, ok := userData["username"].(string); ok {
				return v
			}
			return ""
		}(),
		AvatarImageUrl: func() string {
			if v, ok := userData["avatar_image_url"].(string); ok {
				return v
			}
			return ""
		}(),
		SuicaId: func() string {
			if v, ok := userData["suica_id"].(string); ok {
				return v
			}
			return ""
		}(),
		GreetText: func() string {
			if v, ok := userData["greet_text"].(string); ok {
				return v
			}
			return ""
		}(),
		ByeText: func() string {
			if v, ok := userData["bye_text"].(string); ok {
				return v
			}
			return ""
		}(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	uid := vars["uid"]
	if uid == "" {
		http.Error(w, "uid is required", http.StatusBadRequest)
		return
	}

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// validate
	// if user name is more than 20 characters, return error
	if len(user.Username) > 20 {
		http.Error(w, "username is too long", http.StatusBadRequest)
		return
	}

	userData := map[string]interface{}{
		"username":         user.Username,
		"avatar_image_url": user.AvatarImageUrl,
		"suica_id":         user.SuicaId,
		"greet_text":       user.GreetText,
		"bye_text":         user.ByeText,
	}

	if err := lib.UpsertUser(uid, userData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
