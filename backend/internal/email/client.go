package email

import "github.com/resend/resend-go/v2"

func NewClient(apiKey string) *resend.Client {
	return resend.NewClient(apiKey)
}
