package handlers

import (
	"aigrid/server/lib"
	"net/http"

	"github.com/gorilla/mux"
)

func TriggerHomeSystemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	homeId := vars["homeId"]
	err := lib.TriggerHomeSystem(homeId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}
