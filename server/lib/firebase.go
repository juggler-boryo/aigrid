package lib

import (
	"context"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

var DB *firestore.Client

func InitializeFirebase(credPath string) error {
	ctx := context.Background()
	opt := option.WithCredentialsFile(credPath)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return err
	}

	DB, err = app.Firestore(ctx)
	if err != nil {
		return err
	}

	return nil
}

func GetUser(uid string) (map[string]interface{}, bool, error) {
	doc, err := DB.Collection("users").Doc(uid).Get(context.Background())
	if err != nil {
		return nil, false, err
	}
	if !doc.Exists() {
		return nil, false, nil
	}
	return doc.Data(), true, nil
}

// TODO: 危なそう
func UpsertUser(uid string, data map[string]interface{}) error {
	_, err := DB.Collection("users").Doc(uid).Set(context.Background(), data)
	return err
}
