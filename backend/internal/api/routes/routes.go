package routes

import (
	"github.com/Sachin1373/payflow/backend/internal/api/handlers"
	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine {
	router := gin.Default()

	return router
}

func RegisterRoutes(router *gin.Engine) {

	v1 := router.Group("/api/v1")

	{
		v1.GET("/ping", handlers.PingHandler)
	}
}
