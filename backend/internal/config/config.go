package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort   string
	DBURL     string
	JWTSecret string
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
		AppPort:   getEnv("APP_PORT", "8080"),
		DBURL:     getEnv("DB_URL", ""),
		JWTSecret: getEnv("JWT_SECRET", ""),
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
