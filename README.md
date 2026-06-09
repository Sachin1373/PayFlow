# PayFlow

A payment management platform for businesses — create invoices, track orders, manage customers, and accept payments via Cashfree.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Go + Gin, PostgreSQL, JWT auth |
| Frontend | React + Vite, TypeScript, Tailwind CSS |
| Payments | Cashfree |
| Migrations | golang-migrate |

---

## Prerequisites

- Go 1.25+
- Node.js 18+
- PostgreSQL
- [golang-migrate](https://github.com/golang-migrate/migrate) CLI
- Cashfree account (for payment features)

---

## Setup

### 1. Clone & configure

```bash
git clone https://github.com/Sachin1373/payflow.git
cd payflow
```

Create a `.env` file in the project root:

```env
# Database
DB_URL=postgres://user:password@localhost:5432/payflow?sslmode=disable

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=8080

# Cashfree
CASHFREE_APP_ID=your-app-id
CASHFREE_SECRET_KEY=your-secret-key
CASHFREE_ENV=sandbox   # or production

# Frontend
VITE_API_URL=http://localhost:8080/api/v1
```

### 2. Install dependencies

```bash
make install
```

### 3. Run database migrations

```bash
make migrate-up
```

### 4. Start the servers

```bash
# Backend  (runs on :8080)
make backend-run

# Frontend  (runs on :5173)
make frontend-run
```

---

## API Overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Register a business |
| POST | `/api/v1/auth/login` | — | Login, returns access token |
| POST | `/api/v1/auth/refresh` | — | Refresh access token via cookie |
| POST | `/api/v1/auth/logout` | — | Clear refresh token cookie |
| GET | `/api/v1/auth/me` | ✓ | Get logged-in user profile |
| POST | `/api/v1/invoice/create` | ✓ | Create invoice |
| GET | `/api/v1/invoice/get` | ✓ | List invoices |
| POST | `/api/v1/invoice/send/:id` | ✓ | Send invoice & generate payment link |
| GET | `/api/v1/order/list` | ✓ | List orders |
| GET | `/api/v1/dashboard/stats` | ✓ | Revenue & summary stats |
| POST | `/api/v1/webhooks/cashfree` | — | Cashfree payment webhook |

---

## Screenshots

### Login
![Login](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Invoices
![Invoices](docs/screenshots/invoices.png)

### Orders
![Orders](docs/screenshots/orders.png)

### Customers
![Customers](docs/screenshots/customers.png)
