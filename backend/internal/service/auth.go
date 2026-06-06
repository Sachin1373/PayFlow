package service

import (
	"context"
	"errors"

	"github.com/Sachin1373/payflow/backend/internal/db/repository"
	"github.com/Sachin1373/payflow/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type JWT struct {
}

type AuthService struct {
	repo      *repository.BusinessRepository
	jwtSecret string
}

func NewAuthService(repo *repository.BusinessRepository) *AuthService {
	return &AuthService{
		repo: repo,
	}
}

func (s *AuthService) Register(ctx context.Context, req *models.RegisterRequest) error {
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

func (s *AuthService) Login(ctx context.Context, req *models.Login) (string, error) {
	business, err := s.repo.FindUserByEmail(ctx, req.Email)

	if err != nil {
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(business.Password), []byte(req.Password)); err != nil {
		return "", errors.New("invalid credentials")
	}

	token, err := GenerateToken(business.Uuid, s.jwtSecret)

	if err != nil {
		return "", err
	}

	return token, nil
}
