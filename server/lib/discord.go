package lib

import (
	"encoding/json"
	"log"
	"os"

	"github.com/bwmarrin/discordgo"
)

var Discord *discordgo.Session

func GetDiscordToken() string {
	token, err := os.ReadFile("credentials/aigrid/discord.json")
	if err != nil {
		log.Fatalf("Failed to load Discord token: %v", err)
	}
	var discordConfig struct {
		Token string `json:"token"`
	}
	err = json.Unmarshal(token, &discordConfig)
	if err != nil {
		log.Fatalf("Failed to parse Discord config: %v", err)
	}
	return discordConfig.Token
}

func InitializeDiscord() error {
	token := GetDiscordToken()
	var err error
	Discord, err = discordgo.New("Bot " + token)
	return err
}

func SendMessageToDiscord(channelID string, message string) error {
	_, err := Discord.ChannelMessageSend(channelID, message)
	return err
}

func GetDiscordChannelID() string {
	// TODO: HARD CODED CHANNEL ID
	return "1303483650867859457"
}
