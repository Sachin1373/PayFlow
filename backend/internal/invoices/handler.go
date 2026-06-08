package invoices

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type InvoiceHandler struct {
	service *InvoiceService
}

func NewInvoiceHandler(
	service *InvoiceService,
) *InvoiceHandler {
	return &InvoiceHandler{
		service: service,
	}
}

func (h *InvoiceHandler) CreateInvoice(c *gin.Context) {
	var req CreateInvoiceRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "business id not found",
		})
		return
	}

	err := h.service.CreateInvoice(
		c.Request.Context(),
		businessID.(string),
		&req,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "invoice created successfully",
	})
}

func (h *InvoiceHandler) GetInvoices(c *gin.Context) {

	// query params
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")
	status := c.Query("status")

	// convert to int
	pageInt, err := strconv.Atoi(page)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid page",
		})
		return
	}

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid limit",
		})
		return
	}

	// get business id from middleware
	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "business id not found",
		})
		return
	}

	// optional filter
	var statusPtr *string
	if status != "" {
		statusPtr = &status
	}

	result, err := h.service.GetInvoices(
		c.Request.Context(),
		businessID.(string),
		pageInt,
		limitInt,
		statusPtr,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}
