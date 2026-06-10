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

func (r *ProfileRepository) GetBusinessProfile(ctx context.Context, businessID string) (*BusinessProfileResponse, error) {
	var p BusinessProfileResponse

	err := r.db.QueryRow(ctx, `
		SELECT
			business_name,
			COALESCE(business_email, ''),
			COALESCE(business_phone, ''),
			COALESCE(gst_number, ''),
			COALESCE(logo_url, '')
		FROM business_profile
		WHERE business_id = $1
	`, businessID).Scan(
		&p.BusinessName,
		&p.BusinessEmail,
		&p.BusinessPhone,
		&p.GSTNumber,
		&p.LogoURL,
	)

	if err != nil {
		return nil, err
	}

	return &p, nil
}
