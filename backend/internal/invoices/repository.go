package invoices

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type InvoiceRepository struct {
	db *pgxpool.Pool
}

func NewInvoiceRepository(db *pgxpool.Pool) *InvoiceRepository {
	return &InvoiceRepository{
		db: db,
	}
}

func (i *InvoiceRepository) FindCustomer(ctx context.Context, email string) (*CustomerReq, error) {
	var customer CustomerReq

	err := i.db.QueryRow(ctx,
		`SELECT 
			id,
			name,
			email,
			mobile_no
		FROM customers
		WHERE email = $1
		`, email,
	).Scan(
		&customer.CustomerUuid,
		&customer.CustomerName,
		&customer.CustomerEmail,
		&customer.CustomerPhone,
	)

	if err != nil {
		return nil, err
	}

	return &customer, nil
}

func (i *InvoiceRepository) CreateCustomer(ctx context.Context, businessID string, req *CustomerReq) (string, error) {
	var customerID string

	err := i.db.QueryRow(
		ctx,
		`
		INSERT INTO customers (
			business_id,
			name,
			email,
			mobile_no
		)
		VALUES ($1,$2,$3,$4)
		RETURNING id
		`,
		businessID,
		req.CustomerName,
		req.CustomerEmail,
		req.CustomerPhone,
	).Scan(&customerID)

	if err != nil {
		return "", err
	}

	return customerID, nil
}

func (i *InvoiceRepository) CreateInvoice(ctx context.Context, businessID string, customerID string, req *CreateInvoiceRequest) error {
	tx, err := i.db.Begin(ctx)

	if err != nil {
		return err
	}

	defer tx.Rollback(ctx)

	var invoiceID string

	err = tx.QueryRow(
		ctx,
		`
		INSERT INTO invoices (
			business_id,
			customer_id,
			invoice_no,
			description,
			subtotal,
			tax_rate,
			tax_amount,
			total_amount,
			due_date,
			status
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		RETURNING id
		`,
		businessID,
		customerID,
		req.Invoice.InvoiceNo,
		req.Invoice.Description,
		req.Invoice.Subtotal,
		req.Invoice.TaxRate,
		req.Invoice.TaxAmount,
		req.Invoice.TotalAmount,
		req.Invoice.DueDate,
		"DRAFT",
	).Scan(&invoiceID)

	if err != nil {
		return err
	}

	for _, item := range req.Items {
		_, err = tx.Exec(
			ctx,
			`
			INSERT INTO invoice_items (
				invoice_id,
				description,
				quantity,
				unit_price,
				amount
			)
			VALUES ($1,$2,$3,$4,$5)
			`,
			invoiceID,
			item.Description,
			item.Quantity,
			item.UnitPrice,
			item.Amount,
		)

		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)

}
