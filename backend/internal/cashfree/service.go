package cashfree

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

type Service struct {
	client *Client
}

func NewService(client *Client) *Service {
	return &Service{
		client: client,
	}
}

func (s *Service) CreatePaymentLink(
	ctx context.Context,
	req CreatePaymentLinkRequest,
) (*CreatePaymentLinkResponse, error) {

	// Pretty print request
	reqJSON, _ := json.MarshalIndent(req, "", "  ")

	log.Println("========== CASHFREE CREATE ORDER REQUEST ==========")
	log.Println(string(reqJSON))

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

	log.Println("========== CASHFREE PAYMENT LINK RESPONSE ==========")
	log.Printf("Status: %s\n", resp.Status)
	log.Println(string(respBody))

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

	resultJSON, _ := json.MarshalIndent(result, "", "  ")

	log.Println("========== CASHFREE PAYMENT LINK PARSED ==========")
	log.Println(string(resultJSON))

	return &result, nil
}
