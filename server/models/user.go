package models

type User struct {
	// required
	Uid string `json:"uid"`
	// optionals
	Username       string `json:"username"`
	AvatarImageUrl string `json:"avatar_image_url"`
	SuicaId        string `json:"suica_id"`
}
