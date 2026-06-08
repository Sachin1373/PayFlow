package orders

import (
	"context"
	"fmt"
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

func (o *OrderRepository) GetOrdersPaginated(
	ctx context.Context,
	businessID string,
	limit, offset, page int,
	status, search, fromDate, toDate *string,
) (*PaginatedOrders, error) {

	baseQuery := `
		FROM orders o
		JOIN invoices inv ON inv.id = o.invoice_id
		JOIN customers c ON c.id = inv.customer_id
		WHERE o.business_id = $1
	`

	args := []interface{}{businessID}
	idx := 2

	if status != nil && *status != "" {
		baseQuery += " AND o.status = $" + fmt.Sprint(idx)
		args = append(args, *status)
		idx++
	}

	if search != nil && *search != "" {
		baseQuery += " AND (o.cf_link_id ILIKE $" + fmt.Sprint(idx) + " OR c.name ILIKE $" + fmt.Sprint(idx) + ")"
		args = append(args, "%"+*search+"%")
		idx++
	}

	if fromDate != nil && *fromDate != "" {
		baseQuery += " AND DATE(o.created_at) >= $" + fmt.Sprint(idx)
		args = append(args, *fromDate)
		idx++
	}

	if toDate != nil && *toDate != "" {
		baseQuery += " AND DATE(o.created_at) <= $" + fmt.Sprint(idx)
		args = append(args, *toDate)
		idx++
	}

	var total int
	if err := o.db.QueryRow(ctx, "SELECT COUNT(*) "+baseQuery, args...).Scan(&total); err != nil {
		return nil, err
	}

	query := `
		SELECT
			o.id,
			o.cf_link_id,
			o.invoice_id,
			inv.invoice_no,
			c.name,
			o.amount,
			o.currency,
			o.status,
			COALESCE(o.method, ''),
			o.payment_link,
			o.expires_at,
			o.paid_at,
			o.created_at
	` + baseQuery + `
		ORDER BY o.created_at DESC
		LIMIT $` + fmt.Sprint(idx) + ` OFFSET $` + fmt.Sprint(idx+1)

	args = append(args, limit, offset)

	rows, err := o.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var ord Order
		if err := rows.Scan(
			&ord.OrderID,
			&ord.CFLinkID,
			&ord.InvoiceID,
			&ord.InvoiceNo,
			&ord.CustomerName,
			&ord.Amount,
			&ord.Currency,
			&ord.Status,
			&ord.Method,
			&ord.PaymentLink,
			&ord.ExpiresAt,
			&ord.PaidAt,
			&ord.CreatedAt,
		); err != nil {
			return nil, err
		}
		orders = append(orders, ord)
	}

	if orders == nil {
		orders = []Order{}
	}

	return &PaginatedOrders{Data: orders, Total: total, Page: page, Limit: limit}, nil
}

func (o *OrderRepository) GetOrderByID(ctx context.Context, orderID, businessID string) (*Order, error) {
	var ord Order

	err := o.db.QueryRow(ctx, `
		SELECT
			o.id,
			o.cf_link_id,
			o.invoice_id,
			inv.invoice_no,
			c.name,
			o.amount,
			o.currency,
			o.status,
			COALESCE(o.method, ''),
			o.payment_link,
			o.expires_at,
			o.paid_at,
			o.created_at
		FROM orders o
		JOIN invoices inv ON inv.id = o.invoice_id
		JOIN customers c ON c.id = inv.customer_id
		WHERE o.id = $1 AND o.business_id = $2
	`, orderID, businessID).Scan(
		&ord.OrderID,
		&ord.CFLinkID,
		&ord.InvoiceID,
		&ord.InvoiceNo,
		&ord.CustomerName,
		&ord.Amount,
		&ord.Currency,
		&ord.Status,
		&ord.Method,
		&ord.PaymentLink,
		&ord.ExpiresAt,
		&ord.PaidAt,
		&ord.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &ord, nil
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
