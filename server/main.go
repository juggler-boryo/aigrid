package main

import (
	"aigrid/server/config"
	"aigrid/server/lib"
	"aigrid/server/routes"
	"log"
	"net/http"
)

func main() {
	config.Init()
	err := lib.InitializeDiscord()
	if err != nil {
		log.Fatalf("Failed to initialize Discord: %v", err)
	}
	handler := routes.SetupRouter()
	port := config.GetPort()
	log.Printf("Server running on port: %s", port)
	if err := http.ListenAndServe("0.0.0.0:"+port, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
