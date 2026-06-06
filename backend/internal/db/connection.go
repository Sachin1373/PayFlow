package db

import (
	"context"
	"fmt"

	"github.com/Sachin1373/payflow/backend/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

func DBConn(config *config.Config) (*pgxpool.Pool, error) {
	ctx := context.Background()

	pool, err := pgxpool.New(ctx, config.DBURL)

	if err != nil {
		return nil, fmt.Errorf(
			"unable to create pool: %w",
			err,
		)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf(
			"unable to ping database: %w",
			err,
		)
	}

	return pool, nil
}
