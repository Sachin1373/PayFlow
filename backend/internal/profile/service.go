package profile

import (
	"context"
	"errors"
)

type ProfileService struct {
	repo *ProfileRepository
}

func NewAuthService(repo *ProfileRepository) *ProfileService {
	return &ProfileService{
		repo: repo,
	}
}

func (s *ProfileService) RegisterBussiness(ctx context.Context, req *BusinessProfileRequest, businessID string) error {
	if req.BusinessName == "" {
		return errors.New("business_name is required")
	}

	if req.BusinessEmail == "" {
		return errors.New("business_email is required")
	}

	if req.BusinessPhone == "" {
		return errors.New("business_phone is required")
	}

	if req.GSTNumber == "" {
		return errors.New("gst_number is required")
	}

	return s.repo.ProfileSetup(ctx, businessID, req)
}
