package models

import "time"

type TamakiEventDTO struct {
	Kind int `json:"kind"`
}

type TamakiEvent0DTO struct {
	TamakiEventDTO
	ParticipantsUIDs []string `json:"participants_uids"`
	Title            string   `json:"title"`
	Memo             string   `json:"memo,omitempty"`
	Price            int      `json:"price"`
}

type TamakiEvent1DTO struct {
	TamakiEventDTO
	ParticipantsUIDs []string `json:"participants_uids"`
	Memo             string   `json:"memo,omitempty"`
}

type TamakiEvent struct {
	ID           string    `json:"id" firestore:"id"`
	Kind         int       `json:"kind" firestore:"kind"`
	OrganizerUID string    `json:"organizer_uid" firestore:"organizer_uid"`
	CreatedAt    time.Time `json:"created_at" firestore:"created_at"`
}

type TamakiEvent0 struct {
	TamakiEvent
	ParticipantsUIDs []string `json:"participants_uids" firestore:"participants_uids"`
	Title            string   `json:"title" firestore:"title"`
	Memo             string   `json:"memo,omitempty" firestore:"memo,omitempty"`
	Price            int      `json:"price" firestore:"price"`
}

type TamakiEvent1 struct {
	TamakiEvent
	ParticipantsUIDs []string `json:"participants_uids" firestore:"participants_uids"`
	Memo             string   `json:"memo,omitempty" firestore:"memo,omitempty"`
}
