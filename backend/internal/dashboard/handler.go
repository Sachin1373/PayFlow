package dashboard

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	service *DashboardService
}

func NewDashboardHandler(service *DashboardService) *DashboardHandler {
	return &DashboardHandler{service: service}
}

func (h *DashboardHandler) GetStats(c *gin.Context) {
	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "business id not found"})
		return
	}

	stats, err := h.service.GetStats(c.Request.Context(), businessID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
