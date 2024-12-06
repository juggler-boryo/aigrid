package routes

import (
	"aigrid/server/handlers"
	"aigrid/server/middleware"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func SetupRouter() http.Handler {
	router := mux.NewRouter()
	router.HandleFunc("/users/{uid}", handlers.GetUserByUIDHandler).Methods("GET")
	router.HandleFunc("/niwatori", handlers.WakeUpDiscordNotificationHandler).Methods("POST")
	router.HandleFunc("/neporeon", handlers.SleepDiscordNotificationHandler).Methods("POST")
	// -- Protected routes
	protectedRouter := router.PathPrefix("").Subrouter()
	protectedRouter.Use(middleware.TokenRequired)
	// Users
	protectedRouter.HandleFunc("/users", handlers.ListUsersHandler).Methods("GET")
	protectedRouter.HandleFunc("/users/{uid}", handlers.UpdateUserHandler).Methods("PUT")

	// Inout
	protectedRouter.HandleFunc("/inout/{uid}", handlers.PostInoutHandler).Methods("POST")
	protectedRouter.HandleFunc("/inout/{uid}/minutes", handlers.GetInMinutesHandler).Methods("GET")
	protectedRouter.HandleFunc("/inout/{uid}/history", handlers.GetInoutHistoryHandler).Methods("GET")

	// Tamaki
	protectedRouter.HandleFunc("/tamaki/{id}", handlers.GetTamakiHandler).Methods("GET")
	protectedRouter.HandleFunc("/tamaki", handlers.ListTamakiHandler).Methods("GET")
	protectedRouter.HandleFunc("/tamaki", handlers.CreateTamakiHandler).Methods("POST")
	protectedRouter.HandleFunc("/tamaki/{id}", handlers.UpdateTamakiHandler).Methods("PUT")
	protectedRouter.HandleFunc("/tamaki/{id}", handlers.DeleteTamakiHandler).Methods("DELETE")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	return c.Handler(router)
}
