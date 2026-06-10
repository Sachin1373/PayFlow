package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort              string
	DBURL                string
	JWTSecret            string
	MailApiKey           string
	MailFrom             string
	CashfreeClientID     string
	CashfreeClientSecret string
	CashfreeEnv          string
	AllowedOrigins       string
}

func Load() *Config {
	err := godotenv.Load("../.env")

	if err != nil {
		log.Println(".env file not found, reading from environment")
	}

	return &Config{
		AppPort:              firstNonEmpty(os.Getenv("PORT"), getEnv("APP_PORT", "8080")),
		DBURL:                getEnv("DB_URL", ""),
		JWTSecret:            getEnv("JWT_SECRET", ""),
		MailApiKey:           getEnv("MAIL_API_KEY", ""),
		MailFrom:             getEnv("EMAIL_FROM", ""),
		CashfreeClientID:     getEnv("CASHFREE_CLIENT_ID", ""),
		CashfreeClientSecret: getEnv("CASHFREE_CLIENT_SECRET", ""),
		CashfreeEnv:          getEnv("CASHFREE_ENV", ""),
		AllowedOrigins:       getEnv("ALLOWED_ORIGINS", "http://localhost:5173"),
	}
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}
