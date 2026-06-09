package cashfree

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type CashfreeService struct {
	client *Client
}

func CashfreeNewService(client *Client) *CashfreeService {
	return &CashfreeService{
		client: client,
	}
}

func (s *CashfreeService) CreatePaymentLink(
	ctx context.Context,
	req CreatePaymentLinkRequest,
) (*CreatePaymentLinkResponse, error) {

	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		s.client.baseURL+"/links",
		bytes.NewBuffer(body),
	)

	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("x-client-id", s.client.appID)
	httpReq.Header.Set("x-client-secret", s.client.secretKey)
	httpReq.Header.Set("x-api-version", "2023-08-01")
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.client.httpClient.Do(httpReq)

	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	// Read response body once
	respBody, err := io.ReadAll(resp.Body)

	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf(
			"cashfree returned status %d: %s",
			resp.StatusCode,
			string(respBody),
		)
	}

	var result CreatePaymentLinkResponse

	err = json.Unmarshal(respBody, &result)

	if err != nil {
		return nil, err
	}

	return &result, nil
}
