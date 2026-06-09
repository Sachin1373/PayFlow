package cashfree

import (
	"strings"
	"time"
)

// ── Webhook payload structs ──────────────────────────────────────────────────

type WebhookPayload struct {
	Type string      `json:"type"`
	Data WebhookData `json:"data"`
}

type WebhookData struct {
	Payment         WebhookPayment         `json:"payment"`
	Order           WebhookOrder           `json:"order"`
	CustomerDetails WebhookCustomerDetails `json:"customer_details"`
}

type WebhookOrder struct {
	OrderID     string      `json:"order_id"`
	OrderAmount float64     `json:"order_amount"`
	OrderTags   WebhookLink `json:"order_tags"` // Now correctly nested
}

type WebhookPayment struct {
	CFPaymentID     string               `json:"cf_payment_id"`
	PaymentStatus   string               `json:"payment_status"` // "SUCCESS" | "FAILED"
	PaymentAmount   float64              `json:"payment_amount"`
	PaymentTime     string               `json:"payment_time"`
	Paymentcurrency string               `json:"payment_currency"`
	PaymentMethod   WebhookPaymentMethod `json:"payment_method"`
}

// WebhookPaymentMethod is a discriminated union: only one key is present at a time
// (e.g. "upi", "card", "netbanking"). Use ExtractMethodName to get the active key.
type WebhookPaymentMethod map[string]interface{}

type WebhookLink struct {
	CFLinkID string `json:"cf_link_id"`
	LinkID   string `json:"link_id"` // matches orders.link_id
}

type WebhookCustomerDetails struct {
	CustomerName  string `json:"customer_name"`
	CustomerEmail string `json:"customer_email"`
	CustomerPhone string `json:"customer_phone"`
}

// ExtractMethodName returns the active payment method key in UPPER_CASE (e.g. "UPI", "CARD").
func ExtractMethodName(m WebhookPaymentMethod) string {
	for k := range m {
		return strings.ToUpper(k)
	}
	return "UNKNOWN"
}

type CreatePaymentLinkRequest struct {
	CustomerDetails CustomerDetails `json:"customer_details"`

	LinkAmount          float64 `json:"link_amount"`
	LinkCurrency        string  `json:"link_currency"`
	LinkPurpose         string  `json:"link_purpose"`
	LinkPartialPayments bool    `json:"link_partial_payments"`
}

type CustomerDetails struct {
	CustomerID    string `json:"customer_id"`
	CustomerName  string `json:"customer_name"`
	CustomerEmail string `json:"customer_email"`
	CustomerPhone string `json:"customer_phone"`
}

type CreatePaymentLinkResponse struct {
	CFLinkID        string          `json:"cf_link_id"`
	LinkID          string          `json:"link_id"`
	LinkStatus      string          `json:"link_status"`
	LinkCurrency    string          `json:"link_currency"`
	LinkAmount      float64         `json:"link_amount"`
	LinkURL         string          `json:"link_url"`
	LinkExpiry      time.Time       `json:"link_expiry_time"`
	CustomerDetails CustomerDetails `json:"customer_details"`
}
