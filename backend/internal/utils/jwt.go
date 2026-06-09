package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateAccessToken(
	businessID string,
	email string,
	firstName string,
	lastName string,
	secret string,
) (string, error) {

	claims := jwt.MapClaims{
		"business_id": businessID,
		"email":       email,
		"first_name":  firstName,
		"last_name":   lastName,
		"type":        "access",
		"exp": time.Now().
			Add(15 * time.Minute).
			Unix(),
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	return token.SignedString(
		[]byte(secret),
	)
}

func GenerateRefreshToken(businessID string, email string, secret string) (string, error) {
	claims := jwt.MapClaims{
		"business_id": businessID,
		"email":       email,
		"jti":         uuid.NewString(),
		"type":        "refresh",
		"exp": time.Now().
			Add(30 * 24 * time.Hour).
			Unix(),
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	return token.SignedString(
		[]byte(secret),
	)
}
