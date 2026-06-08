package email

import (
	"context"

	"github.com/resend/resend-go/v2"
)

type Service struct {
	client *resend.Client
	from   string
}

func NewService(client *resend.Client, from string) *Service {
	return &Service{
		client: client,
		from:   from,
	}
}

func (s *Service) Send(ctx context.Context, to string, subject string, html string) error {

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: subject,
		Html:    html,
	}

	_, err := s.client.Emails.Send(params)

	return err
}
