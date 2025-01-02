package routes

import (
	"aigrid/server/handlers"
	"aigrid/server/middleware"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func SetupRouter() http.Handler {
	router := mux.NewRouter()
	router.HandleFunc("/", HealthCheckHandler).Methods("GET")
	router.HandleFunc("/users/{uid}", handlers.GetUserByUIDHandler).Methods("GET")
	router.HandleFunc("/niwatori", handlers.WakeUpDiscordNotificationHandler).Methods("POST")
	router.HandleFunc("/neporeon", handlers.SleepDiscordNotificationHandler).Methods("POST")
	router.HandleFunc("/trash", handlers.TrashDiscordNotificationHandler).Methods("POST")

	// -- nfc nyukan system
	// -- TODO: currently no auth implemented. dangerous.impl
	router.HandleFunc("/nfc/{suica_id}", handlers.GetUserBySuicaIDHandler).Methods("GET")
	router.HandleFunc("/inout/{uid}", handlers.PostInoutHandler).Methods("POST")

	// -- Protected routes
	protectedRouter := router.PathPrefix("").Subrouter()
	protectedRouter.Use(middleware.TokenRequired)
	// Users
	protectedRouter.HandleFunc("/users", handlers.ListUsersHandler).Methods("GET")
	protectedRouter.HandleFunc("/users/{uid}", handlers.UpdateUserHandler).Methods("PUT")

	// Inout
	protectedRouter.HandleFunc("/inout/{uid}/minutes", handlers.GetInMinutesHandler).Methods("GET")
	protectedRouter.HandleFunc("/inout/{uid}/history", handlers.GetInoutHistoryHandler).Methods("GET")
	protectedRouter.HandleFunc("/inout/{uid}/kusa", handlers.GetInoutHistoryByMonthHandler).Methods("GET")
	protectedRouter.HandleFunc("/inout/{uid}/exit_all", handlers.PostExitAllHandler).Methods("POST")
	// Tamaki
	protectedRouter.HandleFunc("/tamaki/{id}", handlers.GetTamakiHandler).Methods("GET")
	protectedRouter.HandleFunc("/tamaki", handlers.ListTamakiHandler).Methods("GET")
	protectedRouter.HandleFunc("/tamaki", handlers.CreateTamakiHandler).Methods("POST")
	protectedRouter.HandleFunc("/tamaki/{id}", handlers.UpdateTamakiHandler).Methods("PUT")
	protectedRouter.HandleFunc("/tamaki/{id}", handlers.DeleteTamakiHandler).Methods("DELETE")

	// home
	protectedRouter.HandleFunc("/home/{homeId}", handlers.TriggerHomeSystemHandler).Methods("POST")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	return c.Handler(router)
}
