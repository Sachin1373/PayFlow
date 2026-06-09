package dashboard

import "context"

type DashboardService struct {
	repo *DashboardRepository
}

func NewDashboardService(repo *DashboardRepository) *DashboardService {
	return &DashboardService{repo: repo}
}

func (s *DashboardService) GetStats(ctx context.Context, businessID string) (*DashboardStats, error) {
	return s.repo.GetStats(ctx, businessID)
}
