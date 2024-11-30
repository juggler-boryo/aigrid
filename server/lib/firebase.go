package lib

import (
	"aigrid/server/models"
	"context"
	"time"

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

func ListUsers() ([]string, error) {
	iter := DB.Collection("users").Documents(context.Background())
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}

	users := make([]string, len(docs))
	for i, doc := range docs {
		users[i] = doc.Ref.ID
	}
	return users, nil
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

func RecordInout(uid string, isIn bool) error {
	_, _, err := DB.Collection("inouts").Add(context.Background(), map[string]interface{}{
		"uid":        uid,
		"is_in":      isIn,
		"created_at": firestore.ServerTimestamp,
	})
	return err
}

func GetUserInMinutes(uid string) (int, error) {
	iter, err := DB.Collection("inouts").Where("uid", "==", uid).OrderBy("created_at", firestore.Desc).Documents(context.Background()).GetAll()
	if err != nil {
		return 0, err
	}

	if len(iter) == 0 {
		return 0, nil
	}

	latestDoc := iter[0]
	latestData := latestDoc.Data()

	if !latestData["is_in"].(bool) {
		return 0, nil
	}

	createdAt := latestData["created_at"].(time.Time)
	minutes := time.Since(createdAt).Minutes()

	return int(minutes), nil
}

func GetInoutHistory(uid string, limit int) ([]models.Inout, error) {
	iter, err := DB.Collection("inouts").Where("uid", "==", uid).OrderBy("created_at", firestore.Desc).Limit(limit).Documents(context.Background()).GetAll()
	if err != nil {
		return nil, err
	}

	if len(iter) == 0 {
		return []models.Inout{}, nil
	}

	inouts := make([]models.Inout, len(iter))
	for i, doc := range iter {
		data := doc.Data()
		inouts[i] = models.Inout{
			Uid:       data["uid"].(string),
			IsIn:      data["is_in"].(bool),
			CreatedAt: data["created_at"].(time.Time),
		}
	}
	return inouts, nil
}

func GetInoutHistoryByMonth() ([]models.Inout, error) {
	now := time.Now()
	oneMonthAgo := now.AddDate(0, -1, 0)

	iter, err := DB.Collection("inouts").Where("created_at", ">=", oneMonthAgo).Where("created_at", "<=", now).OrderBy("created_at", firestore.Desc).Documents(context.Background()).GetAll()
	if err != nil {
		return nil, err
	}

	if len(iter) == 0 {
		return []models.Inout{}, nil
	}

	inouts := make([]models.Inout, len(iter))
	for i, doc := range iter {
		data := doc.Data()
		inouts[i] = models.Inout{
			Uid:       data["uid"].(string),
			IsIn:      data["is_in"].(bool),
			CreatedAt: data["created_at"].(time.Time),
		}
	}
	return inouts, nil
}
