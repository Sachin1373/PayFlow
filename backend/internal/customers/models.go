package customers

type Customer struct {
	ID              string   `json:"id"`
	Name            string   `json:"name"`
	Email           string   `json:"email"`
	Phone           string   `json:"phone"`
	TotalInvoices   int      `json:"total_invoices"`
	TotalPaid       float64  `json:"total_paid"`
	LastInvoiceDate *string  `json:"last_invoice_date"`
}

type CustomerSearchResult struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

type CreateCustomerRequest struct {
	Name  string `json:"name"  binding:"required"`
	Email string `json:"email" binding:"required"`
	Phone string `json:"phone" binding:"required"`
}

type PaginatedCustomers struct {
	Data  []Customer `json:"data"`
	Total int        `json:"total"`
	Page  int        `json:"page"`
	Limit int        `json:"limit"`
}
