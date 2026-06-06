package routes

import (
	"github.com/Sachin1373/payflow/backend/internal/api/handlers"
	"github.com/Sachin1373/payflow/backend/internal/app"
	"github.com/Sachin1373/payflow/backend/internal/db/repository"
	"github.com/Sachin1373/payflow/backend/internal/service"
	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	router := gin.Default()

	return router
}

func RegisterRoutes(router *gin.Engine, app *app.App) {

	repo := repository.NewBusinessRepository(
		app.DB,
	)

	authService := service.NewAuthService(
		repo,
	)

	authHandler := handlers.NewAuthHandler(
		authService,
	)

	v1 := router.Group("/api/v1")

	{
		v1.GET("/ping", handlers.PingHandler)
	}

	auth := v1.Group("auth")

	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}
}
