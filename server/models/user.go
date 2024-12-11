package models

type User struct {
	// required
	Uid string `json:"uid" firestore:"uid"`
	// optionals
	Username       string `json:"username" firestore:"username"`
	AvatarImageUrl string `json:"avatar_image_url" firestore:"avatar_image_url"`
	SuicaId        string `json:"suica_id" firestore:"suica_id"`
	GreetText      string `json:"greet_text" firestore:"greet_text"`
	ByeText        string `json:"bye_text" firestore:"bye_text"`
	PermissionStr  string `json:"permission_str" firestore:"permission_str"`
}
