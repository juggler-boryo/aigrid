package handlers

import (
	"aigrid/server/lib"
	"net/http"
)

func TrashDiscordNotificationHandler(w http.ResponseWriter, r *http.Request) {
	message := "明日は燃えるゴミの日です。"
	channelID := lib.GetDiscordChannelID()
	if err := lib.SendMessageToDiscord(channelID, message); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
