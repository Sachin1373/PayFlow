package cashfree

import "net/http"

type Client struct {
	httpClient *http.Client
	appID      string
	secretKey  string
	baseURL    string
}

func NewClient( appID string, secretKey string, env string) *Client {

	baseURL := "https://sandbox.cashfree.com/pg"

	if env == "production" {
		baseURL = "https://api.cashfree.com/pg"
	}

	return &Client{
		httpClient: &http.Client{},
		appID:      appID,
		secretKey:  secretKey,
		baseURL:    baseURL,
	}
}
