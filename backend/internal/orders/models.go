package orders

import "time"

type Order struct {
	OrderID      string     `json:"order_id"`
	CFLinkID     string     `json:"cf_link_id"`
	InvoiceID    string     `json:"invoice_id"`
	InvoiceNo    string     `json:"invoice_no"`
	CustomerName string     `json:"customer_name"`
	Amount       float64    `json:"amount"`
	Currency     string     `json:"currency"`
	Status       string     `json:"status"`
	Method       string     `json:"method"`
	PaymentLink  string     `json:"payment_link"`
	ExpiresAt    *time.Time `json:"expires_at"`
	PaidAt       *time.Time `json:"paid_at"`
	CreatedAt    time.Time  `json:"created_at"`
}

type PaginatedOrders struct {
	Data  []Order `json:"data"`
	Total int     `json:"total"`
	Page  int     `json:"page"`
	Limit int     `json:"limit"`
}
