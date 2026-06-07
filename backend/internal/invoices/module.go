package invoices

import (
	"github.com/Sachin1373/payflow/backend/internal/app"
)

func NewModule(
	app *app.App,
) *InvoiceHandler {

	repo := NewInvoiceRepository(
		app.DB,
	)

	service := NewAuthService(
		repo,
	)

	handler := NewInvoiceHandler(
		service,
	)

	return handler
}
