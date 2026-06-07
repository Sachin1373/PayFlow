package cashfree

import "github.com/Sachin1373/payflow/backend/internal/app"

func NewModule(app *app.App) *Handler {

	service := NewService()

	return NewHandler(service)
}
