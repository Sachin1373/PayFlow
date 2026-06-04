package main

import (
	"github.com/Sachin1373/payflow/backend/internal/config"
	"github.com/Sachin1373/payflow/backend/internal/db"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	db.DBConn(cfg)

	router := gin.Default()

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "ping",
		})
	})

	router.Run(":" + cfg.AppPort)

}
