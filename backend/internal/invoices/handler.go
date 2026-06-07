package invoices

import (
	"net/http"

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
