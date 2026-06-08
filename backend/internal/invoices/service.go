package invoices

import (
	"context"
	"errors"
	"fmt"
	"time"
)

type InvoiceService struct {
	repo *InvoiceRepository
}

func NewAuthService(repo *InvoiceRepository) *InvoiceService {
	return &InvoiceService{
		repo: repo,
	}
}

func (s *InvoiceService) CreateInvoice(ctx context.Context, businessID string, req *CreateInvoiceRequest) error {
	if req.Customer.CustomerName == "" {
		return errors.New("customer name is required")
	}

	if len(req.Items) == 0 {
		return errors.New("at least one line item is required")
	}

	req.Invoice.InvoiceNo = fmt.Sprintf(
		"INV-%d",
		time.Now().Unix(),
	)

	customer, err := s.repo.FindCustomer(ctx, req.Customer.CustomerEmail)

	if err != nil {
		customerID, err := s.repo.CreateCustomer(
			ctx,
			businessID,
			&req.Customer,
		)

		if err != nil {
			return err
		}

		customer = &CustomerReq{
			CustomerUuid: customerID,
		}
	}

	return s.repo.CreateInvoice(
		ctx,
		businessID,
		customer.CustomerUuid,
		req,
	)
}

func (s *InvoiceService) GetInvoiceByID(ctx context.Context, invoiceID, businessID string) (*InvoiceDetail, error) {
	if invoiceID == "" {
		return nil, errors.New("invoice id is required")
	}
	return s.repo.GetInvoiceByID(ctx, invoiceID, businessID)
}

func (s *InvoiceService) GetInvoices(
	ctx context.Context,
	businessID string,
	page int,
	limit int,
	status *string,
	search *string,
	fromDate *string,
	toDate *string,
) (*PaginatedInvoices, error) {

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

	return s.repo.GetInvoicesPaginated(
		ctx,
		businessID,
		limit,
		offset,
		page,
		status,
		search,
		fromDate,
		toDate,
	)
}
