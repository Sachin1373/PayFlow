package customers

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type CustomerRepository struct {
	db *pgxpool.Pool
}

func NewCustomerRepository(db *pgxpool.Pool) *CustomerRepository {
	return &CustomerRepository{db: db}
}

func (r *CustomerRepository) GetCustomersPaginated(
	ctx context.Context,
	businessID string,
	limit, offset, page int,
	search *string,
) (*PaginatedCustomers, error) {

	whereClause := "WHERE c.business_id = $1"
	filterArgs := []interface{}{businessID}
	argIndex := 2

	if search != nil && *search != "" {
		whereClause += " AND (c.name ILIKE $" + fmt.Sprint(argIndex) + " OR c.email ILIKE $" + fmt.Sprint(argIndex) + ")"
		filterArgs = append(filterArgs, "%"+*search+"%")
		argIndex++
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM customers c " + whereClause
	if err := r.db.QueryRow(ctx, countQuery, filterArgs...).Scan(&total); err != nil {
		return nil, err
	}

	dataArgs := append([]interface{}{}, filterArgs...)
	dataArgs = append(dataArgs, limit, offset)

	dataQuery := `
		SELECT
			c.id,
			c.name,
			c.email,
			c.mobile_no,
			COUNT(inv.id) AS total_invoices,
			COALESCE(SUM(CASE WHEN inv.status = 'PAID' THEN inv.total_amount ELSE 0 END), 0) AS total_paid,
			MAX(inv.created_at) AS last_invoice_date
		FROM customers c
		LEFT JOIN invoices inv ON inv.customer_id = c.id
		` + whereClause + `
		GROUP BY c.id, c.name, c.email, c.mobile_no
		ORDER BY c.name ASC
		LIMIT $` + fmt.Sprint(argIndex) + `
		OFFSET $` + fmt.Sprint(argIndex+1)

	rows, err := r.db.Query(ctx, dataQuery, dataArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := []Customer{}
	for rows.Next() {
		var c Customer
		var lastDate *time.Time
		if err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Email,
			&c.Phone,
			&c.TotalInvoices,
			&c.TotalPaid,
			&lastDate,
		); err != nil {
			return nil, err
		}
		if lastDate != nil {
			s := lastDate.Format("2006-01-02")
			c.LastInvoiceDate = &s
		}
		result = append(result, c)
	}

	return &PaginatedCustomers{
		Data:  result,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

func (r *CustomerRepository) CreateCustomer(
	ctx context.Context,
	businessID string,
	req *CreateCustomerRequest,
) (*Customer, error) {
	var c Customer
	err := r.db.QueryRow(ctx,
		`INSERT INTO customers (business_id, name, email, mobile_no)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, name, email, mobile_no`,
		businessID, req.Name, req.Email, req.Phone,
	).Scan(&c.ID, &c.Name, &c.Email, &c.Phone)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CustomerRepository) SearchCustomers(
	ctx context.Context,
	businessID, query string,
	limit int,
) ([]CustomerSearchResult, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, name, email, mobile_no
		 FROM customers
		 WHERE business_id = $1
		   AND (name ILIKE $2 OR email ILIKE $2)
		 ORDER BY name ASC
		 LIMIT $3`,
		businessID, "%"+query+"%", limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := []CustomerSearchResult{}
	for rows.Next() {
		var sr CustomerSearchResult
		if err := rows.Scan(&sr.ID, &sr.Name, &sr.Email, &sr.Phone); err != nil {
			return nil, err
		}
		results = append(results, sr)
	}
	return results, nil
}
