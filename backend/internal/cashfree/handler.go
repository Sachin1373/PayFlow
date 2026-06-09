package cashfree

import (
	"errors"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type CashfreeHandler struct {
	repo      *WebhookRepository
	secretKey string
}

func NewCashfreeHandler(repo *WebhookRepository, secretKey string) *CashfreeHandler {
	return &CashfreeHandler{repo: repo, secretKey: secretKey}
}

func (h *CashfreeHandler) Webhook(c *gin.Context) {
	log.Println("========== CASHFREE WEBHOOK RECEIVED ==========")
	log.Printf("[webhook] method=%s path=%s remote=%s", c.Request.Method, c.Request.URL.Path, c.Request.RemoteAddr)

	// Read raw body FIRST — must happen before any JSON parsing
	rawBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("[webhook] ERROR: failed to read body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read body"})
		return
	}
	log.Printf("[webhook] raw body (%d bytes): %s", len(rawBody), string(rawBody))

	timestamp := c.GetHeader("x-webhook-timestamp")
	signature := c.GetHeader("x-webhook-signature")
	log.Printf("[webhook] x-webhook-timestamp: %s", timestamp)
	log.Printf("[webhook] x-webhook-signature: %s", signature)

	if timestamp == "" || signature == "" {
		log.Printf("[webhook] ERROR: missing signature headers (timestamp=%q signature=%q)", timestamp, signature)
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing webhook headers"})
		return
	}

	err = ProcessWebhook(c.Request.Context(), h.repo, h.secretKey, rawBody, timestamp, signature)
	if err != nil {
		if errors.Is(err, ErrInvalidSignature) {
			log.Printf("[webhook] ERROR: signature verification failed — check CASHFREE_CLIENT_SECRET")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid signature"})
			return
		}
		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("[webhook] WARNING: no order found for the link_id in this payload — ignoring")
			c.JSON(http.StatusOK, gin.H{"status": "ignored"})
			return
		}
		log.Printf("[webhook] ERROR: processing failed: %v", err)
		// Return 200 so Cashfree retries; idempotency guard prevents double-processing on retry
		c.JSON(http.StatusOK, gin.H{"status": "error"})
		return
	}

	log.Println("[webhook] processing complete — responded 200 ok")
	log.Println("===============================================")
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
