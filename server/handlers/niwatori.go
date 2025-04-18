package handlers

import (
	"aigrid/server/lib"
	"net/http"
)

// Cloud Scheduler APIから呼ばれる
func WakeUpDiscordNotificationHandler(w http.ResponseWriter, r *http.Request) {
	message := "ｺｯｹｺｯｺｫｵｵｵｵｵｵｵｵｵｵｵｵｵｵwwwwwwwwwwwwww"
	channelID := lib.GetDiscordChannelID()
	if err := lib.SendMessageToDiscord(channelID, message); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Cloud Scheduler APIから呼ばれる
func SleepDiscordNotificationHandler(w http.ResponseWriter, r *http.Request) {
	message := "寝ポレオン・寝ナパルトである。寝ろ。"
	channelID := lib.GetDiscordChannelID()
	if err := lib.SendMessageToDiscord(channelID, message); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
