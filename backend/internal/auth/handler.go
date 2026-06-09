package auth

import (
	"net/http"

	"github.com/Sachin1373/payflow/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthHandler struct {
	service *AuthService
}

func NewAuthHandler(
	service *AuthService,
) *AuthHandler {
	return &AuthHandler{
		service: service,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest

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
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": err.Error(),
			},
		)
		return
	}

	accessToken, refreshToken, err := h.service.Login(c.Request.Context(), &req)

	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": err.Error(),
			},
		)
		return
	}

	c.SetCookie(
		"refresh_token",
		refreshToken,
		60*60*24*30,
		"/",
		"",
		false,
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
	},
	)

}

func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "refresh token missing",
		})
		return
	}

	token, err := jwt.Parse(
		refreshToken,
		func(token *jwt.Token) (interface{}, error) {

			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrTokenSignatureInvalid
			}

			return []byte(h.service.jwtSecret), nil
		},
	)

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid refresh token",
		})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid claims",
		})
		return
	}

	tokenType, ok := claims["type"].(string)

	if !ok || tokenType != "refresh" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid token type",
		})
		return
	}

	businessID, ok := claims["business_id"].(string)

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "missing business_id",
		})
		return
	}

	email, ok := claims["email"].(string)

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "missing email",
		})
		return
	}

	business, err := h.service.repo.FindUserByEmail(c.Request.Context(), email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	accessToken, err := utils.GenerateAccessToken(businessID, email, business.FirstName, business.LastName, h.service.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to generate token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accessToken": accessToken,
	})
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	businessID, _ := c.Get("business_id")

	profile, err := h.service.GetProfile(c.Request.Context(), businessID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch profile"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}
