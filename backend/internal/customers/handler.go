package customers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CustomerHandler struct {
	service *CustomerService
}

func NewCustomerHandler(service *CustomerService) *CustomerHandler {
	return &CustomerHandler{service: service}
}

func (h *CustomerHandler) ListCustomers(c *gin.Context) {
	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "business id not found"})
		return
	}

	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")
	search := c.Query("search")

	pageInt, err := strconv.Atoi(page)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid page"})
		return
	}
	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit"})
		return
	}

	var searchPtr *string
	if search != "" {
		searchPtr = &search
	}

	result, err := h.service.GetCustomers(c.Request.Context(), businessID.(string), pageInt, limitInt, searchPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *CustomerHandler) CreateCustomer(c *gin.Context) {
	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "business id not found"})
		return
	}

	var req CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	customer, err := h.service.CreateCustomer(c.Request.Context(), businessID.(string), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, customer)
}

func (h *CustomerHandler) SearchCustomers(c *gin.Context) {
	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "business id not found"})
		return
	}

	q := c.Query("q")
	results, err := h.service.SearchCustomers(c.Request.Context(), businessID.(string), q)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, results)
}
