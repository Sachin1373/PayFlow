package customers

import "github.com/Sachin1373/payflow/backend/internal/app"

func NewModule(app *app.App) *CustomerHandler {
	repo := NewCustomerRepository(app.DB)
	service := NewCustomerService(repo)
	return NewCustomerHandler(service)
}
