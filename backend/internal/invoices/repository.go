package invoices

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type InvoiceRepository struct {
	db *pgxpool.Pool
}

func NewInvoiceRepository(db *pgxpool.Pool) *InvoiceRepository {
	return &InvoiceRepository{
		db: db,
	}
}

func (i *InvoiceRepository) FindCustomer(ctx context.Context, email string) (*CustomerReq, error) {
	var customer CustomerReq

	err := i.db.QueryRow(ctx,
		`SELECT 
			id,
			name,
			email,
			mobile_no
		FROM customers
		WHERE email = $1
		`, email,
	).Scan(
		&customer.CustomerUuid,
		&customer.CustomerName,
		&customer.CustomerEmail,
		&customer.CustomerPhone,
	)

	if err != nil {
		return nil, err
	}

	return &customer, nil
}

func (i *InvoiceRepository) CreateCustomer(ctx context.Context, businessID string, req *CustomerReq) (string, error) {
	var customerID string

	err := i.db.QueryRow(
		ctx,
		`
		INSERT INTO customers (
			business_id,
			name,
			email,
			mobile_no
		)
		VALUES ($1,$2,$3,$4)
		RETURNING id
		`,
		businessID,
		req.CustomerName,
		req.CustomerEmail,
		req.CustomerPhone,
	).Scan(&customerID)

	if err != nil {
		return "", err
	}

	return customerID, nil
}

func (i *InvoiceRepository) CreateInvoice(ctx context.Context, businessID string, customerID string, req *CreateInvoiceRequest) error {
	tx, err := i.db.Begin(ctx)

	if err != nil {
		return err
	}

	defer tx.Rollback(ctx)

	var invoiceID string

	err = tx.QueryRow(
		ctx,
		`
		INSERT INTO invoices (
			business_id,
			customer_id,
			invoice_no,
			description,
			subtotal,
			tax_rate,
			tax_amount,
			total_amount,
			due_date,
			status
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		RETURNING id
		`,
		businessID,
		customerID,
		req.Invoice.InvoiceNo,
		req.Invoice.Description,
		req.Invoice.Subtotal,
		req.Invoice.TaxRate,
		req.Invoice.TaxAmount,
		req.Invoice.TotalAmount,
		req.Invoice.DueDate,
		"DRAFT",
	).Scan(&invoiceID)

	if err != nil {
		return err
	}

	for _, item := range req.Items {
		_, err = tx.Exec(
			ctx,
			`
			INSERT INTO invoice_items (
				invoice_id,
				description,
				quantity,
				unit_price,
				amount
			)
			VALUES ($1,$2,$3,$4,$5)
			`,
			invoiceID,
			item.Description,
			item.Quantity,
			item.UnitPrice,
			item.Amount,
		)

		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)

}

func (i *InvoiceRepository) GetInvoicesPaginated(
	ctx context.Context,
	businessID string,
	limit int,
	offset int,
	page int,
	status *string,
	search *string,
	fromDate *string,
	toDate *string,
) (*PaginatedInvoices, error) {

	var invoices []Invoice
	var total int

	baseQuery := `
		FROM invoices inv
		JOIN customers c ON c.id = inv.customer_id
		WHERE inv.business_id = $1
	`

	args := []interface{}{businessID}
	argIndex := 2

	if status != nil && *status != "" {
		baseQuery += " AND inv.status = $" + fmt.Sprint(argIndex)
		args = append(args, *status)
		argIndex++
	}

	if search != nil && *search != "" {
		baseQuery += " AND (c.name ILIKE $" + fmt.Sprint(argIndex) + " OR inv.invoice_no ILIKE $" + fmt.Sprint(argIndex) + ")"
		args = append(args, "%"+*search+"%")
		argIndex++
	}

	if fromDate != nil && *fromDate != "" {
		baseQuery += " AND DATE(inv.created_at) >= $" + fmt.Sprint(argIndex)
		args = append(args, *fromDate)
		argIndex++
	}

	if toDate != nil && *toDate != "" {
		baseQuery += " AND DATE(inv.created_at) <= $" + fmt.Sprint(argIndex)
		args = append(args, *toDate)
		argIndex++
	}

	countQuery := "SELECT COUNT(*) " + baseQuery
	err := i.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	query := `
		SELECT
			inv.id,
			inv.invoice_no,
			c.name,
			inv.total_amount,
			inv.status,
			inv.due_date,
			inv.created_at
	` + baseQuery + `
		ORDER BY inv.created_at DESC
		LIMIT $` + fmt.Sprint(argIndex) + `
		OFFSET $` + fmt.Sprint(argIndex+1)

	args = append(args, limit, offset)

	rows, err := i.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var inv Invoice
		err := rows.Scan(
			&inv.InvoiceID,
			&inv.InvoiceNo,
			&inv.CustomerName,
			&inv.TotalAmount,
			&inv.Status,
			&inv.DueDate,
			&inv.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		invoices = append(invoices, inv)
	}

	if invoices == nil {
		invoices = []Invoice{}
	}

	return &PaginatedInvoices{
		Data:  invoices,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

func (i *InvoiceRepository) GetInvoiceByID(ctx context.Context, invoiceID, businessID string) (*InvoiceDetail, error) {
	var inv InvoiceDetail

	err := i.db.QueryRow(ctx, `
		SELECT
			inv.id,
			inv.invoice_no,
			c.name,
			c.email,
			c.mobile_no,
			COALESCE(inv.description, ''),
			inv.subtotal,
			inv.tax_rate,
			inv.tax_amount,
			inv.total_amount,
			inv.status,
			inv.due_date,
			inv.created_at
		FROM invoices inv
		JOIN customers c ON c.id = inv.customer_id
		WHERE inv.id = $1 AND inv.business_id = $2
	`, invoiceID, businessID).Scan(
		&inv.InvoiceID,
		&inv.InvoiceNo,
		&inv.CustomerName,
		&inv.CustomerEmail,
		&inv.CustomerPhone,
		&inv.Description,
		&inv.Subtotal,
		&inv.TaxRate,
		&inv.TaxAmount,
		&inv.TotalAmount,
		&inv.Status,
		&inv.DueDate,
		&inv.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	rows, err := i.db.Query(ctx, `
		SELECT description, quantity, unit_price, amount
		FROM invoice_items
		WHERE invoice_id = $1
	`, invoiceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	inv.Items = []LineItem{}
	for rows.Next() {
		var item LineItem
		if err := rows.Scan(&item.Description, &item.Quantity, &item.UnitPrice, &item.Amount); err != nil {
			return nil, err
		}
		inv.Items = append(inv.Items, item)
	}

	return &inv, nil
}
