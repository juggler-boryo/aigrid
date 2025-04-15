package models

import "time"

type Inout struct {
	Uid       string    `json:"uid"`
	IsIn      bool      `json:"is_in"`
	CreatedAt time.Time `json:"created_at"`
	Id        string    `json:"id,omitempty"`
}
