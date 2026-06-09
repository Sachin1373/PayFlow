package auth

import (
	"context"
	"errors"

	"github.com/Sachin1373/payflow/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo      *BusinessRepository
	jwtSecret string
}

func NewAuthService(repo *BusinessRepository, jwtSecret string) *AuthService {
	return &AuthService{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) Register(ctx context.Context, req *RegisterRequest) error {
	exists, err := s.repo.FindBusinessByEmail(ctx, req.Email)

	if err != nil {
		return err
	}

	if exists {
		return errors.New("email already exists")
	}

	hash, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return err
	}

	return s.repo.CreateBusiness(
		ctx,
		req,
		string(hash),
	)
}

func (s *AuthService) Login(ctx context.Context, req *LoginRequest) (string, string, error) {
	business, err := s.repo.FindUserByEmail(ctx, req.Email)

	if err != nil {
		return "", "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(business.Password), []byte(req.Password)); err != nil {
		return "", "", errors.New("invalid credentials")
	}

	accessToken, err := utils.GenerateAccessToken(business.Uuid, business.Email, business.FirstName, business.LastName, s.jwtSecret)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := utils.GenerateRefreshToken(business.Uuid, business.Email, s.jwtSecret)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *AuthService) GetProfile(ctx context.Context, businessID string) (*UserProfile, error) {
	return s.repo.GetProfile(ctx, businessID)
}
