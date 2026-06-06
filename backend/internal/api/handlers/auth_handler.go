package handlers

import (
	"net/http"

	"github.com/Sachin1373/payflow/backend/internal/models"
	"github.com/Sachin1373/payflow/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(
	service *service.AuthService,
) *AuthHandler {
	return &AuthHandler{
		service: service,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": err.Error(),
			},
		)
		return
	}

	err := h.service.Register(
		c.Request.Context(),
		&req,
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
			"message": "business registered successfully",
		},
	)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.Login

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": err.Error(),
			},
		)
		return
	}

	token, err := h.service.Login(c.Request.Context(), &req)

	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": err.Error(),
			},
		)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	},
	)

}
