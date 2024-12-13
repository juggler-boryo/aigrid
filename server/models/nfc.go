package models

type NFCDTO struct {
	UID      string `json:"uid"`
	Username string `json:"username"`
	SuicaID  string `json:"suica_id"`
	IsIn     bool   `json:"is_in"`
}
