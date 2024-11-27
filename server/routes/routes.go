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
	// TODO: tokenいれるなら、uidはパラメタに存在する必要はない。しかし脳死なのでこうしておく。誰か直してくださいお願いします
	protectedRouter.HandleFunc("/users/{uid}", handlers.UpdateUserHandler).Methods("PUT")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	return c.Handler(router)
}