package invoices

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
