package routes

import (
	"github.com/Sachin1373/payflow/backend/internal/app"
	"github.com/Sachin1373/payflow/backend/internal/auth"
	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	router := gin.Default()

	return router
}

func RegisterRoutes(router *gin.Engine, app *app.App) {

	authHandler := auth.NewModule(app)
	v1 := router.Group("/api/v1")

	auth := v1.Group("/auth")

	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}
}
