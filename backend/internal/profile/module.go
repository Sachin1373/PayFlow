package profile

import (
	"github.com/Sachin1373/payflow/backend/internal/app"
)

func NewModule(
	app *app.App,
) *ProfileHandler {

	repo := NewBusinessRepository(
		app.DB,
	)

	service := NewAuthService(
		repo,
	)

	handler := NewProfileHandler(
		service,
	)

	return handler
}
