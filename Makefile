# Backend

include .env
export

backend-run:
	cd backend && go run ./cmd/server

backend-test:
	cd backend && go test ./...

backend-build:
	cd backend && go build -o bin/payflow-api ./cmd/server

# Frontend

frontend-run:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

# Database Migrations

migrate-up:
	cd backend && migrate -path migrations -database "$$DB_URL" up

migrate-down:
	cd backend && migrate -path migrations -database "$$DB_URL" down 1

# Utilities

install:
	cd frontend && npm install
	cd backend && go mod download
