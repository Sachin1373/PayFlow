package orders

import "github.com/Sachin1373/payflow/backend/internal/app"

func NewModule(app *app.App) *OrderHandler {
	repo := NewOrderRepository(app.DB)
	service := NewOrderService(repo)
	return NewOrderHandler(service)
}
