FROM golang:1.25-alpine AS builder
WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

RUN go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /payflow-api ./cmd/server


FROM alpine:latest
RUN apk --no-cache add ca-certificates

COPY --from=builder /go/bin/migrate   /usr/local/bin/migrate
COPY --from=builder /payflow-api      /payflow-api
COPY --from=builder /app/migrations   /migrations

EXPOSE 8080

CMD ["/bin/sh", "-c", "migrate -path /migrations -database \"$DB_URL\" up && /payflow-api"]
