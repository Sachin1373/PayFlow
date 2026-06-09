package cashfree

import "github.com/Sachin1373/payflow/backend/internal/app"

func NewModule(app *app.App) *CashfreeHandler {
	repo := NewWebhookRepository(app.DB)
	return NewCashfreeHandler(repo, app.Config.CashfreeClientSecret)
}
