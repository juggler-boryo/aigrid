package models

type User struct {
	// required
	Uid string `json:"uid" firestore:"uid"`
	// optionals
	Username       string `json:"username" firestore:"username"`
	AvatarImageUrl string `json:"avatar_image_url" firestore:"avatar_image_url"`
	GreetText      string `json:"greet_text" firestore:"greet_text"`
	ByeText        string `json:"bye_text" firestore:"bye_text"`
	MacAddress     string `json:"mac_address" firestore:"mac_address"`
}
