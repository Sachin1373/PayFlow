package main

import (
	"log"
	"time"

	"github.com/gin-contrib/cors"

	"github.com/Sachin1373/payflow/backend/internal/app"
	"github.com/Sachin1373/payflow/backend/internal/config"
	"github.com/Sachin1373/payflow/backend/internal/db"
	"github.com/Sachin1373/payflow/backend/internal/routes"
)

// work of main
// 1. load config
// 2. connect db
// 3. create router
// 4. register routes
// 5. start server

func main() {
	cfg := config.Load()

	pool, err := db.DBConn(cfg)

	if err != nil {
		log.Fatal(err)
	}

	defer pool.Close()

	app := &app.App{
		DB:     pool,
		Config: cfg,
	}

	router := routes.NewRouter()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.RegisterRoutes(router, app)

	log.Printf("Server running on :%s", cfg.AppPort)

	router.Run(":" + cfg.AppPort)

}
