package profile

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProfileHandler struct {
	service *ProfileService
}

func NewProfileHandler(
	service *ProfileService,
) *ProfileHandler {
	return &ProfileHandler{
		service: service,
	}
}

func (h *ProfileHandler) BusinessProfileRegister(c *gin.Context) {
	var req BusinessProfileRequest
	businessID := c.MustGet("business_id").(string)

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": err.Error(),
			},
		)
		return
	}

	err := h.service.RegisterBussiness(
		c.Request.Context(),
		&req,
		businessID,
	)

	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": err.Error(),
			},
		)
		return
	}

	c.JSON(
		http.StatusCreated,
		gin.H{
			"message": "business profile created successfully",
		},
	)

}
