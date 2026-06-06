package main

import (
	"log"

	"github.com/Sachin1373/payflow/backend/internal/api/routes"
	"github.com/Sachin1373/payflow/backend/internal/config"
	"github.com/Sachin1373/payflow/backend/internal/db"
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

	router := routes.NewRouter()

	routes.RegisterRoutes(router)

	log.Printf("Server running on :%s", cfg.AppPort)

	router.Run(":" + cfg.AppPort)

}
