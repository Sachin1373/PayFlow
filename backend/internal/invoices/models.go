package invoices

import "time"

type CustomerReq struct {
	CustomerUuid  string `json:"customer_uuid,omitempty"`
	CustomerName  string `json:"customer_name"`
	CustomerEmail string `json:"customer_email"`
	CustomerPhone string `json:"customer_phone"`
}

type InvoiceReq struct {
	InvoiceNo   string  `json:"invoice_no,omitempty"`
	Description string  `json:"description"`
	Subtotal    float64 `json:"sub_total"`
	TaxRate     float64 `json:"tax_rate"`
	TaxAmount   float64 `json:"tax_amount"`
	TotalAmount float64 `json:"total_amount"`
	DueDate     string  `json:"due_date"`
}

type LineItem struct {
	Description string  `json:"description"`
	Quantity    float64 `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	Amount      float64 `json:"amount"`
}

type CreateInvoiceRequest struct {
	Customer CustomerReq `json:"customer"`
	Invoice  InvoiceReq  `json:"invoice"`
	Items    []LineItem  `json:"items"`
}

type Invoice struct {
	InvoiceID    string    `json:"invoice_id"`
	InvoiceNo    string    `json:"invoice_no"`
	CustomerName string    `json:"customer_name"`
	TotalAmount  float64   `json:"total_amount"`
	Status       string    `json:"status"`
	DueDate      time.Time `json:"due_date"`
	CreatedAt    time.Time `json:"created_at"`
}

type PaginatedInvoices struct {
	Data  []Invoice `json:"data"`
	Total int       `json:"total"`
	Page  int       `json:"page"`
	Limit int       `json:"limit"`
}
