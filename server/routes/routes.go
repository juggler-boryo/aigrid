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
	router.HandleFunc("/", handlers.HelloHandler).Methods("GET")
	// Protected routes
	protectedRouter := router.PathPrefix("").Subrouter()
	protectedRouter.Use(middleware.TokenRequired)
	// protectedRouter.HandleFunc("/", handlers.HelloHandler).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	return c.Handler(router)
}
