package dashboard

type DailyRevenue struct {
	Day    string  `json:"day"`
	Amount float64 `json:"amount"`
}

type StatusBreakdown struct {
	Paid    int `json:"paid"`
	Pending int `json:"pending"`
	Failed  int `json:"failed"`
}

type RecentOrder struct {
	OrderID      string  `json:"order_id"`
	InvoiceNo    string  `json:"invoice_no"`
	CustomerName string  `json:"customer_name"`
	Amount       float64 `json:"amount"`
	Status       string  `json:"status"`
	CreatedAt    string  `json:"created_at"`
}

type DashboardStats struct {
	TotalRevenue         float64         `json:"total_revenue"`
	PaidInvoices         int             `json:"paid_invoices"`
	PendingInvoices      int             `json:"pending_invoices"`
	FailedPayments       int             `json:"failed_payments"`
	CustomersCount       int             `json:"customers_count"`
	RevenueChangePercent float64         `json:"revenue_change_percent"`
	RevenueLast7Days     []DailyRevenue  `json:"revenue_last_7_days"`
	StatusBreakdown      StatusBreakdown `json:"status_breakdown"`
	RecentOrders         []RecentOrder   `json:"recent_orders"`
}
