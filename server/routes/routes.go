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
	// Public routes
	router.HandleFunc("/users/{uid}", handlers.GetUserByUIDHandler).Methods("GET")
	// Protected routes
	protectedRouter := router.PathPrefix("").Subrouter()
	protectedRouter.Use(middleware.TokenRequired)
	protectedRouter.HandleFunc("/users/{uid}", handlers.UpdateUserHandler).Methods("PUT")
	protectedRouter.HandleFunc("/inout/{uid}", handlers.PostInoutHandler).Methods("POST")
	protectedRouter.HandleFunc("/inout/{uid}/minutes", handlers.GetInMinutesHandler).Methods("GET")
	protectedRouter.HandleFunc("/inout/{uid}/history", handlers.GetInoutHistoryHandler).Methods("GET")
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	return c.Handler(router)
}
