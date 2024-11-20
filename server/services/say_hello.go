package services

import (
	"aigrid/server/models"
	"fmt"
)

func SayHello(user models.User) string {
	return fmt.Sprintf("Hello, %s!", user.Username)
}
