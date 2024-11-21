package handlers

import (
	"aigrid/server/models"
	"aigrid/server/services"
	"net/http"
)

func HelloHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(services.SayHello(models.User{
		Uid:      "0",
		Username: "some aigrid member",
	})))
}
