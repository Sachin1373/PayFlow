package auth

import (
	"github.com/Sachin1373/payflow/backend/internal/app"
)

func NewModule(
	app *app.App,
) *AuthHandler {

	repo := NewBusinessRepository(
		app.DB,
	)

	service := NewAuthService(
		repo,
		app.Config.JWTSecret,
	)

	handler := NewAuthHandler(
		service,
	)

	return handler
}
