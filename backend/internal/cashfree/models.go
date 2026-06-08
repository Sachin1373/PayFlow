package cashfree

import "time"

type WebhookPayload struct {
	Type string `json:"type"`
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
