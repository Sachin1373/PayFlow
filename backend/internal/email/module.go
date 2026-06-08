package email

import (
	"github.com/Sachin1373/payflow/backend/internal/app"
)

func NewModule(app *app.App) *Service {

	client := NewClient(app.Config.MailApiKey)

	service := NewService(
		client,
		app.Config.MailFrom,
	)

	return service
}
