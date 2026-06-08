package customers

import (
	"context"
	"errors"
)

type CustomerService struct {
	repo *CustomerRepository
}

func NewCustomerService(repo *CustomerRepository) *CustomerService {
	return &CustomerService{repo: repo}
}

func (s *CustomerService) GetCustomers(
	ctx context.Context,
	businessID string,
	page, limit int,
	search *string,
) (*PaginatedCustomers, error) {
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
	return s.repo.GetCustomersPaginated(ctx, businessID, limit, offset, page, search)
}

func (s *CustomerService) CreateCustomer(
	ctx context.Context,
	businessID string,
	req *CreateCustomerRequest,
) (*Customer, error) {
	if req.Name == "" {
		return nil, errors.New("name is required")
	}
	if req.Email == "" {
		return nil, errors.New("email is required")
	}
	return s.repo.CreateCustomer(ctx, businessID, req)
}

func (s *CustomerService) SearchCustomers(
	ctx context.Context,
	businessID, query string,
) ([]CustomerSearchResult, error) {
	if query == "" {
		return []CustomerSearchResult{}, nil
	}
	return s.repo.SearchCustomers(ctx, businessID, query, 10)
}
