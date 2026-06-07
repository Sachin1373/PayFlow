package profile

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ProfileRepository struct {
	db *pgxpool.Pool
}

func NewBusinessRepository(db *pgxpool.Pool) *ProfileRepository {
	return &ProfileRepository{
		db: db,
	}
}

func (r *ProfileRepository) ProfileSetup(ctx context.Context, businessId string, req *BusinessProfileRequest) error {
	query := `
		INSERT INTO business_profile (
			business_id,
			business_name,
			business_email,
			business_phone,
			gst_number,
			logo_url
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (business_id)
		DO UPDATE SET
			business_name = EXCLUDED.business_name,
			business_email = EXCLUDED.business_email,
			business_phone = EXCLUDED.business_phone,
			gst_number = EXCLUDED.gst_number,
			logo_url = EXCLUDED.logo_url,
			updated_at = NOW()
	`

	_, err := r.db.Exec(
		ctx,
		query,
		businessId,
		req.BusinessName,
		req.BusinessEmail,
		req.BusinessPhone,
		req.GSTNumber,
		req.Logo,
	)

	return err
}
