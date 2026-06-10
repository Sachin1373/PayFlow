package cashfree

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"time"
)

var ErrInvalidSignature = errors.New("invalid webhook signature")

func verifyHMAC(secretKey, timestamp, rawBody, receivedSig string) bool {
	message := timestamp + rawBody
	mac := hmac.New(sha256.New, []byte(secretKey))
	mac.Write([]byte(message))
	expected := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(receivedSig))
}

func ProcessWebhook(
	ctx context.Context,
	repo *WebhookRepository,
	secretKey string,
	rawBody []byte,
	timestamp, signature string,
) error {
	// 1. Verify HMAC before any DB work
	log.Printf("[webhook] step 1: verifying HMAC (message = timestamp + \".\" + rawBody)")
	if !verifyHMAC(secretKey, timestamp, string(rawBody), signature) {
		log.Printf("[webhook] step 1: FAILED — signature mismatch")
		return ErrInvalidSignature
	}
	log.Printf("[webhook] step 1: OK — signature verified")

	// 2. Parse payload
	var payload WebhookPayload
	if err := json.Unmarshal(rawBody, &payload); err != nil {
		log.Printf("[webhook] step 2: ERROR parsing payload: %v", err)
		return err
	}
	log.Printf("[webhook] step 2: parsed — type=%s", payload.Type)

	// 3. Only handle PAYMENT_LINK_EVENT
	if payload.Type != "PAYMENT_SUCCESS_WEBHOOK" && payload.Type != "PAYMENT_FAILED_WEBHOOK" {
		log.Printf("[webhook] step 3: ignoring unsupported event type=%s", payload.Type)
		return nil
	}

	linkID := payload.Data.Order.OrderTags.LinkID
	log.Printf("[webhook] step 3: link_id=%s cf_link_id=%d", linkID, payload.Data.Order.OrderTags.CFLinkID)

	if linkID == "" {
		log.Printf("[webhook] step 3: ERROR — link_id is empty in payload")
		return nil
	}

	// 4. Look up order by link_id
	log.Printf("[webhook] step 4: looking up order for link_id=%s", linkID)
	order, err := repo.GetOrderByLinkID(ctx, linkID)
	if err != nil {
		log.Printf("[webhook] step 4: ERROR — %v", err)
		return err
	}
	log.Printf("[webhook] step 4: found order_id=%s business_id=%s invoice_id=%s current_status=%s",
		order.OrderID, order.BusinessID, order.InvoiceID, order.Status)

	cfPaymentID := payload.Data.Payment.CFPaymentID
	paymentStatus := payload.Data.Payment.PaymentStatus
	log.Printf("[webhook] payment: cf_payment_id=%s status=%s amount=%.2f time=%s",
		cfPaymentID, paymentStatus, payload.Data.Payment.PaymentAmount, payload.Data.Payment.PaymentTime)

	// 4. Idempotency: skip if already processed
	inserted, err := repo.InsertPaymentEvent(ctx, order.OrderID, cfPaymentID, payload.Type, rawBody)

	if err != nil {
		return err
	}

	if !inserted {
		log.Printf(
			"[webhook] duplicate webhook cf_payment_id=%s",
			cfPaymentID,
		)

		return nil
	}

	// 6. Branch on payment status
	log.Printf("[webhook] step 6: processing payment_status=%s", paymentStatus)
	switch paymentStatus {
	case "SUCCESS":
		paidAt, err := time.Parse(time.RFC3339, payload.Data.Payment.PaymentTime)
		if err != nil {
			log.Printf("[webhook] step 6: WARNING — could not parse payment_time %q, using now: %v", payload.Data.Payment.PaymentTime, err)
			paidAt = time.Now()
		}
		method := ExtractMethodName(payload.Data.Payment.PaymentMethod)
		log.Printf("[webhook] step 6: SUCCESS — method=%s paid_at=%s", method, paidAt.Format(time.RFC3339))

		if err := repo.ProcessSuccessPayment(ctx, ProcessSuccessParams{
			OrderID:     order.OrderID,
			InvoiceID:   order.InvoiceID,
			CFPaymentID: cfPaymentID,
			Method:      method,
			PaidAt:      paidAt,
			RawPayload:  rawBody,
		}); err != nil {
			log.Printf("[webhook] step 6: ERROR writing success to DB: %v", err)
			return err
		}
		log.Printf("[webhook] step 6: DB updated — order=%s → PAID, invoice=%s → PAID, payment_event inserted", order.OrderID, order.InvoiceID)

	case "FAILED":
		log.Printf("[webhook] step 6: FAILED — marking order=%s as FAILED", order.OrderID)
		method := ExtractMethodName(payload.Data.Payment.PaymentMethod)
		if err := repo.ProcessFailedPayment(ctx, ProcessFailedParams{
			OrderID:     order.OrderID,
			CFPaymentID: cfPaymentID,
			Method:      method,
			RawPayload:  rawBody,
		}); err != nil {
			log.Printf("[webhook] step 6: ERROR writing failure to DB: %v", err)
			return err
		}
		log.Printf("[webhook] step 6: DB updated — order=%s → FAILED, payment_event inserted", order.OrderID)

	default:
		log.Printf("[webhook] step 6: WARNING — unhandled payment_status=%s for order=%s", paymentStatus, order.OrderID)
	}

	return nil
}
