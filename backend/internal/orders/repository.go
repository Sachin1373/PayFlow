package orders

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type OrderRepository struct {
	db *pgxpool.Pool
}

type CreateOrderParams struct {
	InvoiceID     string
	CFOrderID     string
	CFPaymentLink string
	Amount        float64
	Currency      string
	Status        string
	ExpiresAt     time.Time
	LinkId        string
}

func NewOrderRepository(db *pgxpool.Pool) *OrderRepository {
	return &OrderRepository{
		db: db,
	}
}

func (o *OrderRepository) CheckExistingOrder(ctx context.Context, invoiceID string) (bool, error) {
	var exists bool

	err := o.db.QueryRow(
		ctx,
		`
		SELECT EXISTS(
			SELECT 1
			FROM orders
			WHERE invoice_id = $1
			AND status = 'PENDING'
		)
		`,
		invoiceID,
	).Scan(&exists)

	return exists, err
}

func (o *OrderRepository) CreateOrder(
	ctx context.Context,
	businessID string,
	params *CreateOrderParams,
) error {

	_, err := o.db.Exec(
		ctx,
		`
		INSERT INTO orders (
			business_id,
			invoice_id,
			cf_link_id,
			payment_link,
			amount,
			currency,
			status,
			expires_at,
			link_id
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		`,
		businessID,
		params.InvoiceID,
		params.CFOrderID,
		params.CFPaymentLink,
		params.Amount,
		params.Currency,
		params.Status,
		params.ExpiresAt,
		params.LinkId,
	)

	return err
}
