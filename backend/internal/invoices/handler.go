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

func (h *InvoiceHandler) GetInvoice(c *gin.Context) {
	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "business id not found"})
		return
	}

	invoiceID := c.Param("id")
	if invoiceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invoice id is required"})
		return
	}

	result, err := h.service.GetInvoiceByID(c.Request.Context(), invoiceID, businessID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *InvoiceHandler) GetInvoices(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")
	status := c.Query("status")
	search := c.Query("search")
	fromDate := c.Query("from_date")
	toDate := c.Query("to_date")

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

	businessID, exists := c.Get("business_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "business id not found"})
		return
	}

	toPtr := func(s string) *string {
		if s == "" {
			return nil
		}
		return &s
	}

	result, err := h.service.GetInvoices(
		c.Request.Context(),
		businessID.(string),
		pageInt,
		limitInt,
		toPtr(status),
		toPtr(search),
		toPtr(fromDate),
		toPtr(toDate),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
