package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(
	businessID string,
	secret string,
) (string, error) {

	claims := jwt.MapClaims{
		"business_id": businessID,
		"exp": time.Now().
			Add(24 * time.Hour).
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
