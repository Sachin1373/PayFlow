package orders

import (
	"context"
	"errors"
)

type OrderService struct {
	repo *OrderRepository
}

func NewOrderService(repo *OrderRepository) *OrderService {
	return &OrderService{repo: repo}
}

func (s *OrderService) GetOrders(
	ctx context.Context,
	businessID string,
	page, limit int,
	status, search, fromDate, toDate *string,
) (*PaginatedOrders, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit
	return s.repo.GetOrdersPaginated(ctx, businessID, limit, offset, page, status, search, fromDate, toDate)
}

func (s *OrderService) GetOrderByID(ctx context.Context, orderID, businessID string) (*Order, error) {
	if orderID == "" {
		return nil, errors.New("order id is required")
	}
	return s.repo.GetOrderByID(ctx, orderID, businessID)
}
