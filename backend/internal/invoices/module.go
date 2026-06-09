package invoices

import (
	"github.com/Sachin1373/payflow/backend/internal/app"
	"github.com/Sachin1373/payflow/backend/internal/cashfree"
	"github.com/Sachin1373/payflow/backend/internal/email"
	"github.com/Sachin1373/payflow/backend/internal/orders"
)

func NewModule(
	app *app.App,
) *InvoiceHandler {

	repo := NewInvoiceRepository(
		app.DB,
	)

	orderRepo := orders.NewOrderRepository(app.DB)

	emailService := email.NewModule(app)

	cashfreeClient := cashfree.NewClient(
		app.Config.CashfreeClientID,
		app.Config.CashfreeClientSecret,
		app.Config.CashfreeEnv,
	)

	cashfreeService := cashfree.CashfreeNewService(cashfreeClient)

	service := NewInvoiceService(
		repo,
		orderRepo,
		cashfreeService,
		emailService,
	)

	handler := NewInvoiceHandler(
		service,
	)

	return handler
}
