package middleware

import (
	"context"
	"net/http"
	"strings"

	"log"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"google.golang.org/api/option"
)

var (
	authClient *auth.Client
)

// Initialize Firebase App and Auth Client
func init() {
	// Replace "path/to/serviceAccountKey.json" with the path to your Firebase service account key
	opt := option.WithCredentialsFile("./credentials/aigrid/sa.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	authClient, err = app.Auth(context.Background())
	if err != nil {
		log.Fatalf("error initializing auth client: %v\n", err)
	}
}

// TokenRequired is a middleware that ensures the request has a valid Firebase token
func TokenRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the Authorization header
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Extract the token from the header
		idToken := strings.TrimPrefix(authHeader, "Bearer ")
		idToken = strings.TrimSpace(idToken)

		// Verify the token with Firebase Auth
		token, err := authClient.VerifyIDToken(context.Background(), idToken)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Optionally, you can add the token claims to the request context
		ctx := context.WithValue(r.Context(), "firebaseToken", token)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
