package dashboard

import "github.com/Sachin1373/payflow/backend/internal/app"

func NewModule(app *app.App) *DashboardHandler {
	repo := NewDashboardRepository(app.DB)
	service := NewDashboardService(repo)
	return NewDashboardHandler(service)
}
