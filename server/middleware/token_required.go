package middleware

import (
	"net/http"
	"strings"
)

func TokenRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		strings.TrimPrefix(authHeader, "Bearer ")
		// TODO: Implement token validation logic
		// For example, verify the token with Firebase Auth

		// If token is invalid:
		// http.Error(w, "Unauthorized", http.StatusUnauthorized)
		// return

		// If token is valid, proceed to the next handler
		next.ServeHTTP(w, r)
	})
}
