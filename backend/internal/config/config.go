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
	// RedisHost     string
	// RedisPort     string
	// RedisPassword string
}

func Load() *Config {
	err := godotenv.Load("../.env")

	if err != nil {
		log.Println(".env file not found")
	}

	return &Config{
		AppPort:              getEnv("APP_PORT", "8080"),
		DBURL:                getEnv("DB_URL", ""),
		JWTSecret:            getEnv("JWT_SECRET", ""),
		MailApiKey:           getEnv("MAIL_API_KEY", ""),
		MailFrom:             getEnv("EMAIL_FROM", ""),
		CashfreeClientID:     getEnv("CASHFREE_CLIENT_ID", ""),
		CashfreeClientSecret: getEnv("CASHFREE_CLIENT_SECRET", ""),
		CashfreeEnv:          getEnv("CASHFREE_ENV", ""),
		// RedisHost:     getEnv("REDIS_HOST", "localhost"),
		// RedisPort:     getEnv("REDIS_PORT", "6379"),
		// RedisPassword: getEnv("REDIS_PASSWORD", ""),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}
