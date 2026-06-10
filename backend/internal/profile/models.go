package profile

type BusinessProfileRequest struct {
	BusinessName  string `json:"bussiness_name"`
	BusinessEmail string `json:"bussiness_email"`
	BusinessPhone string `json:"bussiness_phone"`
	GSTNumber     string `json:"gst_number"`
	Logo           string `json:"logo"`
}

type BusinessProfileResponse struct {
	BusinessName  string `json:"business_name"`
	BusinessEmail string `json:"business_email"`
	BusinessPhone string `json:"business_phone"`
	GSTNumber     string `json:"gst_number"`
	LogoURL       string `json:"logo_url"`
}

type ApiConfigurationRequest struct {
	AppId         string `json:"app_id"`
	SecretKey     string `json:"secret_key"`
	WebhookSecret string `json:"webhook_secret"`
}

type NotificationRequest struct {
	EmailPaymentReceived bool `json:"email_payment_received"`
	EmailPaymentFailed   bool `json:"email_payment_failed"`
	EmailPaymentOverdue  bool `json:"email_payment_overdue"`
}
