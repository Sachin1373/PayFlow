package cashfree

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WebhookRepository struct {
	db *pgxpool.Pool
}

func NewWebhookRepository(db *pgxpool.Pool) *WebhookRepository {
	return &WebhookRepository{db: db}
}

type OrderLookupResult struct {
	OrderID    string
	BusinessID string
	InvoiceID  string
	Status     string
}

type ProcessSuccessParams struct {
	OrderID     string
	InvoiceID   string
	CFPaymentID string
	Method      string
	PaidAt      time.Time
	RawPayload  []byte
}

type ProcessFailedParams struct {
	OrderID     string
	CFPaymentID string
	Method      string
	RawPayload  []byte
}

func (r *WebhookRepository) GetOrderByLinkID(ctx context.Context, linkID string) (*OrderLookupResult, error) {
	var res OrderLookupResult
	err := r.db.QueryRow(ctx,
		`SELECT id, business_id, invoice_id, status FROM orders WHERE link_id = $1 LIMIT 1`,
		linkID,
	).Scan(&res.OrderID, &res.BusinessID, &res.InvoiceID, &res.Status)
	if err != nil {
		return nil, err
	}
	return &res, nil
}

// func (r *WebhookRepository) IsDuplicatePaymentEvent(ctx context.Context, orderID, cfPaymentID string) (bool, error) {
// 	var exists bool
// 	err := r.db.QueryRow(ctx,
// 		`SELECT EXISTS(SELECT 1 FROM payment_events WHERE order_id = $1 AND cf_payment_id = $2)`,
// 		orderID, cfPaymentID,
// 	).Scan(&exists)
// 	return exists, err
// }

func (r *WebhookRepository) InsertPaymentEvent(ctx context.Context, orderID string, cfPaymentID string, eventType string, payload []byte) (bool, error) {
	tag, err := r.db.Exec(ctx,
		`
		INSERT INTO payment_events (
			order_id,
			cf_payment_id,
			event_type,
			payload
		)
		VALUES ($1,$2,$3,$4)
		ON CONFLICT (cf_payment_id, event_type)
		DO NOTHING
		`,
		orderID,
		cfPaymentID,
		eventType,
		payload,
	)

	if err != nil {
		return false, err
	}

	return tag.RowsAffected() > 0, nil
}

func (r *WebhookRepository) ProcessSuccessPayment(ctx context.Context, params ProcessSuccessParams) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx,
		`UPDATE orders SET status='PAID', paid_at=$1, method=$2, updated_at=NOW() WHERE id=$3 AND status <> 'PAID'`,
		params.PaidAt, params.Method, params.OrderID,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE invoices SET status='PAID', updated_at=NOW() WHERE id=$1 AND status <> 'PAID'`,
		params.InvoiceID,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *WebhookRepository) ProcessFailedPayment(ctx context.Context, params ProcessFailedParams) error {

	_, err := r.db.Exec(
		ctx,
		`
		UPDATE orders
		SET
			status = 'FAILED',
			method = $1,
			updated_at = NOW()
		WHERE id = $2
		  AND status <> 'PAID'
		`,
		params.Method,
		params.OrderID,
	)

	return err
}
