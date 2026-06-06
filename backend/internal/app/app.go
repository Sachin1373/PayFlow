package app

import (
	"github.com/Sachin1373/payflow/backend/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

type App struct {
	DB     *pgxpool.Pool
	Config *config.Config
}
