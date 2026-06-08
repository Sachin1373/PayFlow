package orders

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	service *OrderService
}

func NewOrderHandler(service *OrderService) *OrderHandler {
	return &OrderHandler{service: service}
}

func (h *OrderHandler) GetOrders(c *gin.Context) {
	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "business id not found"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	toPtr := func(s string) *string {
		if s == "" {
			return nil
		}
		return &s
	}

	result, err := h.service.GetOrders(
		c.Request.Context(),
		businessID.(string),
		page, limit,
		toPtr(c.Query("status")),
		toPtr(c.Query("search")),
		toPtr(c.Query("from_date")),
		toPtr(c.Query("to_date")),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "business id not found"})
		return
	}

	result, err := h.service.GetOrderByID(c.Request.Context(), c.Param("id"), businessID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
