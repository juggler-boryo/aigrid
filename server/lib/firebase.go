package lib

import (
	"aigrid/server/models"
	"context"
	"fmt"
	"sort"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/db"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

var (
	DB   *firestore.Client
	RTDB *db.Client
)

func InitializeFirebase(credPath string) error {
	ctx := context.Background()
	opt := option.WithCredentialsFile(credPath)

	conf := &firebase.Config{
		DatabaseURL:   "https://aigrid-23256-default-rtdb.asia-southeast1.firebasedatabase.app",
		ProjectID:     "aigrid-23256",
		StorageBucket: "aigrid-23256.firebasestorage.app",
	}

	app, err := firebase.NewApp(ctx, conf, opt)
	if err != nil {
		return fmt.Errorf("error initializing firebase app: %w", err)
	}

	DB, err = app.Firestore(ctx)
	if err != nil {
		return fmt.Errorf("error initializing firestore: %w", err)
	}

	RTDB, err = app.Database(ctx)
	if err != nil {
		return fmt.Errorf("error initializing realtime database client: %w", err)
	}

	if RTDB == nil {
		return fmt.Errorf("realtime database client is nil after initialization")
	}

	return nil
}
func ListUsers() ([]string, error) {
	iter := DB.Collection("users").Where("permission_str", "in", []string{"GENERAL", "ADMIN"}).Documents(context.Background())
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

func GetUserBySuicaID(suicaID string) (map[string]interface{}, error) {
	iter := DB.Collection("users").Where("suica_id", "==", suicaID).Documents(context.Background())
	doc, err := iter.Next()
	if err != nil {
		return nil, err
	}
	data := doc.Data()
	data["uid"] = doc.Ref.ID
	return data, nil
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
	// Only fetch the latest record instead of all records
	iter := DB.Collection("inouts").
		Where("uid", "==", uid).
		OrderBy("created_at", firestore.Desc).
		Limit(1).
		Documents(context.Background())

	doc, err := iter.Next()
	if err != nil {
		if err == iterator.Done {
			return 0, nil
		}
		return 0, err
	}

	data := doc.Data()
	if !data["is_in"].(bool) {
		return 0, nil
	}

	createdAt := data["created_at"].(time.Time)
	minutes := time.Since(createdAt).Minutes()

	return int(minutes), nil
}

func GetInoutHistory(uid string, limit int) ([]models.Inout, error) {
	iter := DB.Collection("inouts").
		Where("uid", "==", uid).
		OrderBy("created_at", firestore.Desc).
		Limit(limit).
		Documents(context.Background())

	var inouts []models.Inout
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		data := doc.Data()
		inouts = append(inouts, models.Inout{
			Uid:       data["uid"].(string),
			IsIn:      data["is_in"].(bool),
			CreatedAt: data["created_at"].(time.Time),
			Id:        doc.Ref.ID,
		})
	}

	if len(inouts) == 0 {
		return []models.Inout{}, nil
	}
	return inouts, nil
}

func UpdateInout(input models.Inout) error {
	_, err := DB.Collection("inouts").Doc(input.Id).Set(context.Background(), map[string]interface{}{
		"created_at": input.CreatedAt,
		"is_in":      input.IsIn,
		"uid":        input.Uid,
	})
	return err
}

func GetInoutHistoryByMonthByUID(uid string) ([]map[string]interface{}, error) {
	now := time.Now()
	// TODO: 1年分だとサーバー負荷が高いので、1ヶ月分にしたい。はやくクラスター作るぞ✨
	oneYearAgo := now.AddDate(-1, 0, 0)

	// Use streaming iterator for better memory efficiency
	iter := DB.Collection("inouts").
		Where("uid", "==", uid).
		Where("created_at", ">=", oneYearAgo).
		Where("created_at", "<=", now).
		Where("is_in", "==", true).
		OrderBy("created_at", firestore.Desc).
		Documents(context.Background())

	dateCount := make(map[string]int)
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		data := doc.Data()
		createdAt := data["created_at"].(time.Time)
		date := createdAt.Format("2006-01-02")
		dateCount[date]++
	}

	result := make([]map[string]interface{}, 0, len(dateCount))
	for date, count := range dateCount {
		parsedDate, _ := time.Parse("2006-01-02", date)
		result = append(result, map[string]interface{}{
			"count": count,
			"date":  parsedDate,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i]["date"].(time.Time).After(result[j]["date"].(time.Time))
	})

	return result, nil
}

func GetIsIn(uid string) (bool, error) {
	// Only fetch the latest record instead of all records
	iter := DB.Collection("inouts").
		Where("uid", "==", uid).
		OrderBy("created_at", firestore.Desc).
		Limit(1).
		Documents(context.Background())

	doc, err := iter.Next()
	if err != nil {
		if err == iterator.Done {
			return false, nil
		}
		return false, err
	}

	data := doc.Data()
	return data["is_in"].(bool), nil
}

func GetInoutHistoryByMonth() ([]models.Inout, error) {
	now := time.Now()
	oneMonthAgo := now.AddDate(0, -1, 0)

	// Use streaming iterator for better memory efficiency
	iter := DB.Collection("inouts").
		Where("created_at", ">=", oneMonthAgo).
		Where("created_at", "<=", now).
		OrderBy("created_at", firestore.Desc).
		Documents(context.Background())

	var inouts []models.Inout
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		data := doc.Data()
		inouts = append(inouts, models.Inout{
			Uid:       data["uid"].(string),
			IsIn:      data["is_in"].(bool),
			CreatedAt: data["created_at"].(time.Time),
		})
	}

	if len(inouts) == 0 {
		return []models.Inout{}, nil
	}
	return inouts, nil
}

func UpdateRealtimeDBInout(uid string, isIn bool) error {
	if RTDB == nil {
		return fmt.Errorf("realtime database client is not initialized")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ref := RTDB.NewRef("inoutList/" + uid)

	err := ref.Set(ctx, isIn)
	if err != nil {
		return fmt.Errorf("failed to update realtime DB: %w", err)
	}

	return nil
}

func TriggerHomeSystem(homeId string) error {
	if RTDB == nil {
		return fmt.Errorf("realtime database client is not initialized")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ref := RTDB.NewRef("home/" + homeId)

	var currentValue int
	if err := ref.Get(ctx, &currentValue); err != nil {
		if err.Error() == "snapshot: nil value" {
			currentValue = 0
		} else {
			return fmt.Errorf("failed to get current value: %w", err)
		}
	}

	// 1足した値をセットすることで、ホームシステム(finyl)をトリガーする
	newValue := currentValue + 1
	err := ref.Set(ctx, newValue)
	if err != nil {
		return fmt.Errorf("failed to update home system trigger: %w", err)
	}

	return nil
}

func GetInoutHistoryByDateRange(startDate, endDate time.Time) ([]models.Inout, error) {
	// Use streaming iterator for better memory efficiency
	iter := DB.Collection("inouts").
		Where("created_at", ">=", startDate).
		Where("created_at", "<=", endDate).
		OrderBy("created_at", firestore.Desc).
		Documents(context.Background())

	var inouts []models.Inout
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}

		data := doc.Data()
		inouts = append(inouts, models.Inout{
			Uid:       data["uid"].(string),
			IsIn:      data["is_in"].(bool),
			CreatedAt: data["created_at"].(time.Time),
		})
	}

	if len(inouts) == 0 {
		return []models.Inout{}, nil
	}
	return inouts, nil
}
