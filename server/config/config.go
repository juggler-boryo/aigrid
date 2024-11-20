package config

import (
	"aigrid/server/lib"
	"os"
)

func Init() error {
	return lib.InitializeFirebase("credentials/aigrid/sa.json")
}

func GetPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return port
}
