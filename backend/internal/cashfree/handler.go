package cashfree

import (
	"log"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) Webhook(c *gin.Context) {

	var payload map[string]interface{}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	log.Printf("Cashfree Webhook: %+v\n", payload)

	c.JSON(200, gin.H{
		"status": "received",
	})
}
