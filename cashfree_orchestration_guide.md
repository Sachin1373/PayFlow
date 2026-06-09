**CASHFREE PAYMENT**

**ORCHESTRATION SYSTEM**

*Mini Stripe Layer — SDE-1 Portfolio Project*

**Stack:** React + TypeScript  •  Go (Gin)  •  PostgreSQL  •  Cashfree APIs

Everything you need to build, ship & pitch this project


# **1. Project Overview**
This document is your single source of truth for building a production-style payment orchestration layer on top of Cashfree. It covers architecture, folder structure, database design, step-by-step build guide, testing strategy (including local webhook tunnelling), and everything you need to confidently demo this to the Cashfree engineering team.

## **1.1 System Goals**
- Invoice creation with line-item breakdown and tax support
- Cashfree payment link generation via SDK / REST
- Webhook-based real-time payment reconciliation
- Idempotent order processing (no duplicate charges)
- SaaS-grade React dashboard — live status, charts, retry
- Postgres event-ledger for full audit trail
- Localised webhook testing with ngrok / Cloudflare Tunnel

## **1.2 Why This Project Gets You Hired**

|**Cashfree relevance**|You build on the exact API surface the team maintains every day|
| :- | :- |
|**Backend depth**|Go + Gin microservice with idempotency, retry, and event sourcing|
|**Frontend polish**|React dashboard shows real-time reconciliation — not just CRUD|
|**Ops awareness**|Dockerised, env-config, graceful shutdown, structured logging|
|**Testing maturity**|Unit tests, integration tests, and live webhook e2e via tunnel|


# **2. High-Level Architecture**
The system is split into three bounded contexts connected through PostgreSQL as the single source of truth and a lightweight in-process event bus.

## **2.1 Component Map**

|**Layer**|**Technology**|**Port**|**Responsibility**|
| :- | :- | :- | :- |
|React SPA|React 18 + Vite + TS|5173|Dashboard, invoice creation, payment status|
|API Gateway|Go 1.22 + Gin|8080|REST endpoints, auth middleware, rate limit|
|Payment Svc|Go + Cashfree SDK|—|Create orders, generate payment links|
|Webhook Svc|Go + HMAC verify|8081|Receive Cashfree events, reconcile DB|
|PostgreSQL|Postgres 16|5432|Invoices, orders, payments, event ledger|
|Redis|Redis 7|6379|Idempotency keys, rate-limit counters|

## **2.2 Request Flow — Happy Path**
- User fills invoice form in React SPA
- POST /api/invoices → Go creates invoice row (status: DRAFT)
- POST /api/invoices/:id/pay → Go calls Cashfree Create Order API
- Cashfree returns payment\_link; stored in orders table; status → PENDING
- User is redirected to Cashfree hosted checkout
- After payment, Cashfree POSTs webhook to /webhooks/cashfree
- Webhook handler verifies HMAC signature, updates order status → PAID / FAILED
- Dashboard polls GET /api/orders (or SSE) and shows real-time status

## **2.3 Webhook Reconciliation Flow**
*Webhooks require a publicly reachable HTTPS URL. In local dev you MUST use a tunnel. See Section 7.*

- Cashfree signs every webhook with HMAC-SHA256 using your webhook secret
- Your handler rejects any request where x-webhook-signature header does not match
- After verifying, handler checks if order exists, marks idempotency key in Redis
- If idempotency key already present → return 200 immediately (replay protection)
- Otherwise write payment\_events row, update orders.status, commit transaction
- Dashboard reflects new status within seconds via polling or SSE


# **3. Monorepo Structure**
## **3.1 Initialise the Repo**
mkdir cashfree-orchestrator && cd cashfree-orchestrator

git init

\# Create top-level workspace files

touch docker-compose.yml .env.example Makefile README.md

## **3.2 Full Folder Tree**
cashfree-orchestrator/

├── backend/                     # Go monolith (split to services later)

│   ├── cmd/

│   │   └── server/main.go       # Entry point

│   ├── internal/

│   │   ├── api/                 # Gin route handlers

│   │   │   ├── invoices.go

│   │   │   ├── orders.go

│   │   │   └── webhook.go

│   │   ├── cashfree/            # Cashfree SDK wrapper

│   │   │   ├── client.go

│   │   │   └── types.go

│   │   ├── db/                  # Postgres queries (sqlc-generated)

│   │   │   ├── queries/

│   │   │   ├── migrations/

│   │   │   └── db.go

│   │   ├── middleware/          # Auth, logger, rate-limit

│   │   ├── models/              # Domain structs

│   │   └── service/             # Business logic layer

│   ├── go.mod

│   └── Dockerfile

├── frontend/                    # React + Vite + TS

│   ├── src/

│   │   ├── api/                 # Axios client + React Query hooks

│   │   ├── components/          # UI components (shadcn/ui)

│   │   ├── pages/               # Dashboard, Invoices, Orders

│   │   ├── store/               # Zustand global state

│   │   └── types/               # Shared TS types

│   ├── package.json

│   └── Dockerfile

├── migrations/                  # Standalone SQL migrations

├── scripts/                     # Seed, tunnel, test helpers

├── docker-compose.yml

├── Makefile

└── .env.example

## **3.3 Bootstrap Commands**
### **Backend (Go)**
cd backend

go mod init github.com/yourname/cashfree-orchestrator/backend

go get github.com/gin-gonic/gin

go get github.com/cashfree/cashfree-pg/v4        # Official Cashfree Go SDK

go get github.com/jackc/pgx/v5

go get github.com/redis/go-redis/v9

go get github.com/golang-migrate/migrate/v4

go get github.com/joho/godotenv

go get github.com/rs/zerolog

go get github.com/stretchr/testify

### **Frontend (React + Vite + TS)**
cd frontend

npm create vite@latest . -- --template react-ts

npm install

npm install axios @tanstack/react-query zustand

npm install recharts date-fns

npm install -D tailwindcss postcss autoprefixer

npx tailwindcss init -p

npx shadcn-ui@latest init

### **Docker Compose (run everything)**
\# from project root

docker compose up -d          # starts postgres, redis

make migrate-up               # applies DB migrations

make dev-backend              # go run ./cmd/server

make dev-frontend             # npm run dev


# **4. Database Design**
## **4.1 Entity Relationship Summary**

|**customers**|One customer → many invoices|
| :- | :- |
|**invoices**|One invoice → many line\_items, one order|
|**orders**|Maps 1-to-1 with a Cashfree order, holds status|
|**payment\_events**|Append-only log; every Cashfree webhook payload|
|**idempotency\_keys**|Prevents duplicate event processing|

## **4.2 Migration: 001\_init.sql**
-- customers

CREATE TABLE customers (

`  `id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

`  `name        TEXT NOT NULL,

`  `email       TEXT NOT NULL UNIQUE,

`  `phone       TEXT,

`  `created\_at  TIMESTAMPTZ NOT NULL DEFAULT now()

);

-- invoices

CREATE TABLE invoices (

`  `id            UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

`  `customer\_id   UUID NOT NULL REFERENCES customers(id),

`  `invoice\_no    TEXT NOT NULL UNIQUE,   -- e.g. INV-2024-0001

`  `status        TEXT NOT NULL DEFAULT 'DRAFT',  -- DRAFT|SENT|PAID|VOID

`  `currency      TEXT NOT NULL DEFAULT 'INR',

`  `subtotal      NUMERIC(12,2) NOT NULL,

`  `tax\_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,

`  `total\_amount  NUMERIC(12,2) NOT NULL,

`  `due\_date      DATE,

`  `notes         TEXT,

`  `created\_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

`  `updated\_at    TIMESTAMPTZ NOT NULL DEFAULT now()

);

-- line\_items

CREATE TABLE line\_items (

`  `id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

`  `invoice\_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

`  `description TEXT NOT NULL,

`  `quantity    NUMERIC(10,3) NOT NULL,

`  `unit\_price  NUMERIC(12,2) NOT NULL,

`  `amount      NUMERIC(12,2) NOT NULL  -- quantity \* unit\_price

);

-- orders  (1-to-1 with Cashfree order)

CREATE TABLE orders (

`  `id                  UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

`  `invoice\_id          UUID NOT NULL REFERENCES invoices(id),

`  `cf\_order\_id         TEXT NOT NULL UNIQUE,  -- Cashfree's order\_id

`  `cf\_payment\_link     TEXT NOT NULL,

`  `amount              NUMERIC(12,2) NOT NULL,

`  `currency            TEXT NOT NULL DEFAULT 'INR',

`  `status              TEXT NOT NULL DEFAULT 'PENDING',

`  `-- PENDING|PAID|FAILED|EXPIRED|REFUNDED

`  `idempotency\_key     TEXT NOT NULL UNIQUE,

`  `expires\_at          TIMESTAMPTZ,

`  `paid\_at             TIMESTAMPTZ,

`  `created\_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

`  `updated\_at          TIMESTAMPTZ NOT NULL DEFAULT now()

);

-- payment\_events  (append-only ledger)

CREATE TABLE payment\_events (

`  `id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

`  `order\_id        UUID NOT NULL REFERENCES orders(id),

`  `cf\_payment\_id   TEXT,

`  `event\_type      TEXT NOT NULL,  -- PAYMENT\_SUCCESS|PAYMENT\_FAILED|REFUND

`  `payload         JSONB NOT NULL, -- raw Cashfree webhook body

`  `processed\_at    TIMESTAMPTZ NOT NULL DEFAULT now()

);

-- indexes

CREATE INDEX idx\_orders\_cf\_order\_id   ON orders(cf\_order\_id);

CREATE INDEX idx\_orders\_invoice\_id     ON orders(invoice\_id);

CREATE INDEX idx\_payment\_events\_order  ON payment\_events(order\_id);

CREATE INDEX idx\_invoices\_customer     ON invoices(customer\_id);

## **4.3 Key Design Decisions**
- Use NUMERIC(12,2) for all monetary values — never FLOAT (floating-point rounding bugs in finance are catastrophic)
- payment\_events is append-only — never UPDATE or DELETE rows; this is your audit trail
- idempotency\_key on orders prevents creating two Cashfree orders for the same invoice
- status as TEXT (not ENUM) makes migrations easier when Cashfree adds new statuses
- Store the raw Cashfree webhook payload as JSONB — invaluable for debugging


# **5. Step-by-Step Build Guide**
*Follow phases in order. Each phase results in a working, testable slice of the system.*

## **Phase 1 — Project Scaffolding (Day 1)**
### **What to build**
- Monorepo structure as in Section 3
- Docker Compose for Postgres + Redis
- First migration (Section 4)
- Go server that returns 200 OK on GET /health
### **Things you need to know**
- Go modules: go mod init, go.mod, go.sum — understand replace directives
- Gin basics: gin.New() vs gin.Default(), RouterGroup, c.JSON(), c.ShouldBindJSON()
- pgx/v5: pgxpool.New() for connection pooling; always use context.Background() or request ctx
- golang-migrate: embed SQL files in binary with //go:embed or run as shell
- godotenv: load .env in main.go before everything else
### **Key commands**
go run ./cmd/server/...

curl http://localhost:8080/health   # expect {status:ok}

## **Phase 2 — Invoice CRUD (Day 2)**
### **What to build**
- POST /api/invoices — create invoice + line\_items in one DB transaction
- GET  /api/invoices — list with pagination
- GET  /api/invoices/:id — detail with line\_items
- PATCH /api/invoices/:id/status — DRAFT → SENT
### **Things you need to know**
- Postgres transactions with pgx: tx, err := pool.Begin(ctx); defer tx.Rollback(ctx)
- Row scanning: rows.Scan() or use sqlc for type-safe query generation
- Invoice number generation: use Postgres sequence or format with LPAD(nextval(), 6, '0')
- Always validate input — check amount > 0, required fields, valid email format
### **React side (parallel)**
- Create InvoiceForm component with React Hook Form + Zod validation
- useQuery / useMutation from React Query for data fetching
- Axios instance with base URL from env, interceptor for 401 handling

## **Phase 3 — Cashfree Integration (Day 3-4)**
### **What to build**
- POST /api/invoices/:id/pay — creates Cashfree order, stores in orders table
- GET  /api/orders — list all orders with status
- GET  /api/orders/:id — detail view
### **Things you need to know — Cashfree Specifics**
- Sandbox vs Production: use SANDBOX env first; credentials are different
- App ID + Secret Key: set in .env, never commit. Use cashfreepg.XClientId / XClientSecret
- Cashfree Go SDK: cashfreepg.CreateOrder() returns cf\_order\_id and payment\_session\_id
- payment\_link: use https://sandbox.cashfree.com/pg/view/order/{order\_id} for sandbox testing
- Idempotency: pass your internal order UUID as order\_id to Cashfree — if you call twice, it returns the same order
- Customer object is required: CustomerName, CustomerEmail, CustomerPhone
- order\_amount must be >= 1 INR, order\_currency must be INR for domestic
### **Go code pattern**
client := cashfreepg.New()

client.XClientId = os.Getenv("CF\_APP\_ID")

client.XClientSecret = os.Getenv("CF\_SECRET\_KEY")

client.XEnvironment = cashfreepg.SANDBOX

req := cashfreepg.CreateOrderRequest{

`  `OrderAmount:   invoice.TotalAmount,

`  `OrderCurrency: "INR",

`  `OrderId:       idempotencyKey,   // your UUID

`  `CustomerDetails: cashfreepg.CustomerDetails{

`    `CustomerId:    customer.ID,

`    `CustomerEmail: customer.Email,

`    `CustomerPhone: customer.Phone,

`  `},

`  `OrderMeta: &cashfreepg.OrderMeta{

`    `ReturnUrl: "https://yourapp.com/payment/return?order\_id={order\_id}",

`    `NotifyUrl: "https://YOUR\_TUNNEL/webhooks/cashfree",

`  `},

}

## **Phase 4 — Webhook Handler (Day 5)**
### **What to build**
- POST /webhooks/cashfree — receive, verify, reconcile
- Signature verification middleware
- Idempotency check via Redis
- DB update inside a transaction
### **Things you need to know**
- Cashfree sends: x-webhook-signature, x-webhook-ts headers with each event
- Signature = HMAC-SHA256(timestamp + raw\_body, webhook\_secret)
- Always read raw body first (io.ReadAll), verify HMAC, THEN json.Unmarshal
- Event types: PAYMENT\_SUCCESS\_WEBHOOK, PAYMENT\_FAILED\_WEBHOOK, REFUND\_SUCCESS\_WEBHOOK
- Return 200 quickly — Cashfree retries on non-200 up to 5 times with backoff
- Never return 500 for business logic errors (duplicate event) — return 200 after idempotency check
### **Signature verification (Go)**
func verifySignature(secret, ts, body string, sig string) bool {

`  `mac := hmac.New(sha256.New, []byte(secret))

`  `mac.Write([]byte(ts + body))

`  `expected := base64.StdEncoding.EncodeToString(mac.Sum(nil))

`  `return hmac.Equal([]byte(expected), []byte(sig))

}

## **Phase 5 — React Dashboard (Day 6-7)**
### **What to build**
- Dashboard page: stats cards (total revenue, paid/pending/failed counts)
- Orders table with status badge, amount, customer, last updated
- Invoice creation wizard (3-step form)
- Order detail drawer with payment events timeline
- Recharts: revenue over time (line), payment status breakdown (pie)
### **Things you need to know**
- React Query: queryClient.invalidateQueries() after mutation to refresh lists
- Polling: useQuery({ refetchInterval: 5000 }) for live status updates
- SSE alternative: EventSource API with useEffect cleanup
- Recharts ResponsiveContainer must have a fixed height parent div
- Tailwind with shadcn/ui: run npx shadcn-ui@latest add button card table badge

## **Phase 6 — Polish & Ops (Day 8)**
- Structured logging with zerolog (include request\_id, order\_id in every log)
- Graceful shutdown: signal.NotifyContext + srv.Shutdown(ctx)
- Rate limiting middleware: golang.org/x/time/rate or Redis token bucket
- Health check that verifies DB + Redis connectivity
- Docker multi-stage build for backend (scratch base, ~10 MB image)
- Environment-based config struct — no os.Getenv() scattered through business logic


# **6. Environment Config**
## **6.1 .env.example**
\# Server

PORT=8080

WEBHOOK\_PORT=8081

ENV=development

\# Postgres

DATABASE\_URL=postgres://postgres:postgres@localhost:5432/cashfree\_orch?sslmode=disable

\# Redis

REDIS\_URL=redis://localhost:6379/0

\# Cashfree Sandbox

CF\_APP\_ID=your\_sandbox\_app\_id

CF\_SECRET\_KEY=your\_sandbox\_secret\_key

CF\_WEBHOOK\_SECRET=your\_webhook\_secret

CF\_ENV=SANDBOX   # or PRODUCTION

\# Frontend

VITE\_API\_BASE\_URL=http://localhost:8080

## **6.2 Makefile**
dev-backend:

`	`cd backend && go run ./cmd/server/...

dev-frontend:

`	`cd frontend && npm run dev

migrate-up:

`	`cd backend && go run ./cmd/migrate/... up

test-backend:

`	`cd backend && go test ./... -v -cover

tunnel:

`	`ngrok http 8081   # expose webhook port

docker-up:

`	`docker compose up -d


# **7. Webhook Testing (Local HTTPS)**
*Cashfree REQUIRES a public HTTPS URL for webhooks. localhost:8081 will be rejected. You have three options below.*

## **7.1 Option A — ngrok (Recommended for dev)**
- Install: brew install ngrok / choco install ngrok / download from ngrok.com
- Authenticate: ngrok config add-authtoken YOUR\_TOKEN
- Run alongside your app: ngrok http 8081
- Copy the https://xxxx.ngrok-free.app URL
- Set CF\_WEBHOOK\_URL=https://xxxx.ngrok-free.app/webhooks/cashfree in Cashfree sandbox dashboard
- ngrok also gives you a web inspector at http://localhost:4040 — shows every webhook with full payload and lets you REPLAY it

*Pro tip: ngrok replay is invaluable. Break your handler on purpose, fix it, replay the event — no need to re-trigger a payment.*

## **7.2 Option B — Cloudflare Tunnel (Free, stable URL)**
brew install cloudflared

cloudflared tunnel --url http://localhost:8081

- Gives a stable trycloudflare.com HTTPS URL — no auth required
- Good when ngrok free tier URL changes every restart

## **7.3 Option C — localtunnel (npm)**
npx localtunnel --port 8081 --subdomain cashfree-wh

- URL: https://cashfree-wh.loca.lt — more predictable subdomain

## **7.4 Testing Strategy End-to-End**

|**Test Type**|**Tool**|**What it verifies**|
| :- | :- | :- |
|Unit|Go testing + testify|HMAC verification, idempotency logic, amount calculation|
|Integration|pgx + testcontainers|DB writes inside transactions, rollback on error|
|Handler|httptest.NewRecorder|Gin handler returns correct status codes + response shape|
|Webhook e2e|ngrok + Cashfree sandbox|Full round-trip: pay → webhook → DB status update|
|Frontend|Vitest + Testing Library|Form validation, status badge rendering, API mocks|

## **7.5 Useful Webhook Test Payloads**
In Cashfree sandbox, use the 'Test Webhooks' panel to send simulated events. Alternatively, craft your own:

\# Simulate a PAYMENT\_SUCCESS webhook manually

TS=$(date +%s)

BODY='{"type":"PAYMENT\_SUCCESS\_WEBHOOK","data":{"order":{"order\_id":"YOUR\_ORDER\_ID","order\_amount":500},"payment":{"cf\_payment\_id":"99999","payment\_status":"SUCCESS"}}}'

SIG=$(echo -n "${TS}${BODY}" | openssl dgst -sha256 -hmac "YOUR\_WEBHOOK\_SECRET" -binary | base64)

curl -X POST https://your-tunnel/webhooks/cashfree \

`  `-H 'Content-Type: application/json' \

`  `-H "x-webhook-ts: $TS" \

`  `-H "x-webhook-signature: $SIG" \

`  `-d "$BODY"


# **8. API Reference**

|**Method**|**Path**|**Auth**|**Description**|
| :- | :- | :- | :- |
|GET|/health|None|Liveness + DB/Redis check|
|POST|/api/invoices|API Key|Create invoice + line items|
|GET|/api/invoices|API Key|List invoices (pagination)|
|GET|/api/invoices/:id|API Key|Get invoice detail|
|PATCH|/api/invoices/:id/status|API Key|Update invoice status|
|POST|/api/invoices/:id/pay|API Key|Create Cashfree order + payment link|
|GET|/api/orders|API Key|List orders with status|
|GET|/api/orders/:id|API Key|Order detail + payment events|
|POST|/webhooks/cashfree|HMAC|Receive Cashfree payment events|
|GET|/api/analytics/summary|API Key|Revenue totals, status counts|
|GET|/api/analytics/revenue|API Key|Revenue time series (last 30 days)|

## **8.1 Auth Strategy**
- API endpoints: simple X-API-Key header (store hashed key in DB)
- Webhook endpoint: HMAC-SHA256 verification only — no API key (Cashfree calls this)
- For a real system you'd use JWT + refresh tokens, but API key is fine for a portfolio project


# **9. Email to Cashfree CEO — Outreach Template**
*Personalise this. Replace placeholders with specifics. Keep it under 150 words. CEOs read on mobile.*

|<p>**Subject: Built a payment orchestration layer on Cashfree — applying for SDE-1**</p><p>Hi [Name],</p><p>I built a mini payment orchestration system — think a lightweight Stripe layer — on top of Cashfree's APIs to learn the stack deeply before applying. It handles invoice creation, Cashfree order generation, webhook-based reconciliation, and a real-time React dashboard. Written in Go (Gin) + PostgreSQL + React TypeScript.</p><p>GitHub: github.com/yourname/cashfree-orchestrator  |  Demo: [loom or live URL]</p><p>I'm applying for the SDE-1 role. I'd love 15 minutes to walk through the architecture with your team.</p><p>Best, [Your Name] | [Phone] | [LinkedIn]</p>|
| :- |

## **9.1 What Makes This Email Work**
- You lead with proof, not aspiration — you already built on their API
- GitHub + demo link means they can verify in 2 minutes without asking
- Short — respects their time, signals strong communication skills
- Specific ask: 15 minutes, not a generic 'please consider me'

*Send on a Tuesday or Wednesday morning (IST). Follow up once after 5 business days if no reply.*


# **10. Project Checklist**
## **Before You Submit / Demo**

|**Done**|**Item**|
| :- | :- |
|☐|All migrations run cleanly on a fresh DB|
|☐|Cashfree sandbox order creation works end-to-end|
|☐|Webhook HMAC verification rejects tampered payloads|
|☐|Duplicate webhook replayed → returns 200, DB not double-written|
|☐|Order status updates correctly in DB after webhook|
|☐|React dashboard shows correct status after payment|
|☐|All Go handlers have unit tests (>70% coverage)|
|☐|Webhook handler has integration test with httptest|
|☐|README has: setup instructions, env vars, architecture diagram|
|☐|No secrets committed to git (check with git log -p | grep CF\_)|
|☐|Docker Compose brings up entire stack with one command|
|☐|Loom demo recorded (5 min: create invoice → pay → dashboard updates)|
|☐|GitHub repo is public with a clear README and demo GIF|



Webhook
   ↓
Verify Signature
   ↓
Parse Payload
   ↓
Find Order
   ↓
Insert payment_event
      ↓
Duplicate?
      ↓
YES → Return 200
      ↓
NO
      ↓
SUCCESS?
      ↓
NO → Return 200
      ↓
Update Order PAID
      ↓
Update Invoice PAID
      ↓
Commit