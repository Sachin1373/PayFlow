package repository

import (
	"context"

	"github.com/Sachin1373/payflow/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BusinessRepository struct {
	db *pgxpool.Pool
}

func NewBusinessRepository(db *pgxpool.Pool) *BusinessRepository {
	return &BusinessRepository{
		db: db,
	}
}

func (r *BusinessRepository) FindBusinessByEmail(ctx context.Context, email string) (bool, error) {
	var exists bool

	err := r.db.QueryRow(ctx,
		`
		SELECT EXISTS(
			SELECT 1
			FROM business
			WHERE email = $1
		)
		`,
		email,
	).Scan(&exists)

	return exists, err
}

func (r *BusinessRepository) CreateBusiness(ctx context.Context, req *models.RegisterRequest, hashedPassword string) error {
	_, err := r.db.Exec(
		ctx,
		`
		INSERT INTO business (
			first_name,
			last_name,
			mobile_no,
			email,
			password
		)
		VALUES ($1,$2,$3,$4,$5)
		`,
		req.FirstName,
		req.LastName,
		req.MobileNo,
		req.Email,
		hashedPassword,
	)
	return err

}

func (r *BusinessRepository) FindUserByEmail(ctx context.Context, email string) (*models.Business, error) {
	var business models.Business

	err := r.db.QueryRow(ctx,
		`
		SELECT
			uuid,
			first_name,
			last_name,
			mobile_no,
			email,
			password 
		FROM business
		WHERE email = $1
		`, email,
	).Scan(
		&business.Uuid,
		&business.FirstName,
		&business.LastName,
		&business.MobileNo,
		&business.Email,
		&business.Password)

	if err != nil {
		return nil, err
	}

	return &business, nil
}
