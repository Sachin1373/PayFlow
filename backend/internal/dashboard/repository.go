package dashboard

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DashboardRepository struct {
	db *pgxpool.Pool
}

func NewDashboardRepository(db *pgxpool.Pool) *DashboardRepository {
	return &DashboardRepository{db: db}
}

func (r *DashboardRepository) GetStats(ctx context.Context, businessID string) (*DashboardStats, error) {
	stats := &DashboardStats{}

	// Total revenue this month and change vs last month
	var currentMonthRevenue, lastMonthRevenue float64
	if err := r.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0)
		FROM orders
		WHERE business_id = $1
		  AND status = 'PAID'
		  AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE)
	`, businessID).Scan(&currentMonthRevenue); err != nil {
		return nil, err
	}
	if err := r.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0)
		FROM orders
		WHERE business_id = $1
		  AND status = 'PAID'
		  AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
	`, businessID).Scan(&lastMonthRevenue); err != nil {
		return nil, err
	}
	stats.TotalRevenue = currentMonthRevenue
	if lastMonthRevenue > 0 {
		stats.RevenueChangePercent = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
	}

	// Invoice counts: paid and awaiting payment (SENT)
	if err := r.db.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE status = 'PAID'),
			COUNT(*) FILTER (WHERE status = 'SENT')
		FROM invoices
		WHERE business_id = $1
	`, businessID).Scan(&stats.PaidInvoices, &stats.PendingInvoices); err != nil {
		return nil, err
	}

	// Failed payments count
	if err := r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM orders WHERE business_id = $1 AND status = 'FAILED'
	`, businessID).Scan(&stats.FailedPayments); err != nil {
		return nil, err
	}

	// Total customers
	if err := r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM customers WHERE business_id = $1
	`, businessID).Scan(&stats.CustomersCount); err != nil {
		return nil, err
	}

	// Revenue last 7 days (fill missing days with 0 via generate_series)
	rows, err := r.db.Query(ctx, `
		SELECT
			TO_CHAR(gs.day, 'Dy') AS day_label,
			COALESCE(SUM(o.amount), 0)  AS amount
		FROM generate_series(
			CURRENT_DATE - INTERVAL '6 days',
			CURRENT_DATE,
			'1 day'::interval
		) AS gs(day)
		LEFT JOIN orders o
			ON DATE(o.paid_at) = gs.day::date
			AND o.business_id = $1
			AND o.status = 'PAID'
		GROUP BY gs.day
		ORDER BY gs.day ASC
	`, businessID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var d DailyRevenue
		if err := rows.Scan(&d.Day, &d.Amount); err != nil {
			return nil, err
		}
		stats.RevenueLast7Days = append(stats.RevenueLast7Days, d)
	}
	if stats.RevenueLast7Days == nil {
		stats.RevenueLast7Days = []DailyRevenue{}
	}

	// Order status breakdown
	if err := r.db.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE status = 'PAID'),
			COUNT(*) FILTER (WHERE status IN ('PENDING', 'EXPIRED', 'ACTIVE')),
			COUNT(*) FILTER (WHERE status = 'FAILED')
		FROM orders WHERE business_id = $1
	`, businessID).Scan(
		&stats.StatusBreakdown.Paid,
		&stats.StatusBreakdown.Pending,
		&stats.StatusBreakdown.Failed,
	); err != nil {
		return nil, err
	}

	// Recent 5 orders
	orderRows, err := r.db.Query(ctx, `
		SELECT o.id, inv.invoice_no, c.name, o.amount, o.status, o.created_at
		FROM orders o
		JOIN invoices inv ON inv.id = o.invoice_id
		JOIN customers c   ON c.id  = inv.customer_id
		WHERE o.business_id = $1
		ORDER BY o.created_at DESC
		LIMIT 5
	`, businessID)
	if err != nil {
		return nil, err
	}
	defer orderRows.Close()
	for orderRows.Next() {
		var ro RecentOrder
		var createdAt time.Time
		if err := orderRows.Scan(&ro.OrderID, &ro.InvoiceNo, &ro.CustomerName, &ro.Amount, &ro.Status, &createdAt); err != nil {
			return nil, err
		}
		ro.CreatedAt = createdAt.Format("2006-01-02")
		stats.RecentOrders = append(stats.RecentOrders, ro)
	}
	if stats.RecentOrders == nil {
		stats.RecentOrders = []RecentOrder{}
	}

	return stats, nil
}
