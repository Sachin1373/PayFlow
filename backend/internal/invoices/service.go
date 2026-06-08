package invoices

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/Sachin1373/payflow/backend/internal/cashfree"
	"github.com/Sachin1373/payflow/backend/internal/email"
	"github.com/Sachin1373/payflow/backend/internal/orders"
)

type InvoiceService struct {
	repo            *InvoiceRepository
	orderRepo       *orders.OrderRepository
	cashfreeService *cashfree.Service
	emailService    *email.Service
}

func NewInvoiceService(repo *InvoiceRepository, orderRepo *orders.OrderRepository, cashfreeService *cashfree.Service, emailService *email.Service) *InvoiceService {
	return &InvoiceService{
		repo:            repo,
		orderRepo:       orderRepo,
		cashfreeService: cashfreeService,
		emailService:    emailService,
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

func (s *InvoiceService) SendInvoice(
	ctx context.Context,
	invoiceID string,
	businessID string,
) error {

	invoice, err := s.repo.GetInvoiceByID(
		ctx,
		invoiceID,
		businessID,
	)

	if err != nil {
		return err
	}

	exists, err := s.orderRepo.CheckExistingOrder(
		ctx,
		invoiceID,
	)

	if err != nil {
		return err
	}

	if exists {
		return errors.New("pending order already exists")
	}

	linkReq := cashfree.CreatePaymentLinkRequest{
		CustomerDetails: cashfree.CustomerDetails{
			CustomerName:  invoice.CustomerName,
			CustomerEmail: invoice.CustomerEmail,
			CustomerPhone: invoice.CustomerPhone,
		},

		LinkAmount:          float64(invoice.TotalAmount),
		LinkCurrency:        "INR",
		LinkPurpose:         invoice.InvoiceNo,
		LinkPartialPayments: false,
	}

	paymentLink, err := s.cashfreeService.CreatePaymentLink(
		ctx,
		linkReq,
	)

	log.Println("paymentLink :", paymentLink)

	log.Printf(
		"Payment Link Created: %s",
		paymentLink.LinkURL,
	)

	if err != nil {
		return err
	}

	// save order

	err = s.orderRepo.CreateOrder(
		ctx,
		businessID,
		&orders.CreateOrderParams{
			InvoiceID:     invoice.InvoiceID,
			CFOrderID:     paymentLink.CFLinkID,
			CFPaymentLink: paymentLink.LinkURL,
			Amount:        paymentLink.LinkAmount,
			Currency:      paymentLink.LinkCurrency,
			Status:        paymentLink.LinkStatus,
			ExpiresAt:     paymentLink.LinkExpiry,
			LinkId:        paymentLink.LinkID,
		},
	)

	if err != nil {
		return err
	}

	// send email
	

	return nil
}
