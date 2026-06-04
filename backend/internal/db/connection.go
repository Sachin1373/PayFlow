package db

import (
	"context"
	"fmt"

	"github.com/Sachin1373/payflow/backend/internal/config"
	"github.com/jackc/pgx/v5"
)

func DBConn(config *config.Config) {
	conn, err := pgx.Connect(context.Background(), config.DBURL)

	if err != nil {
		fmt.Printf("Unable to connect to database")
	}

	fmt.Printf("database connected succesfully!!!!")

	defer conn.Close(context.Background())
}
