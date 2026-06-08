package email

import (
	"fmt"
	"strings"
	"time"
)

type InvoiceEmailData struct {
	CustomerName string
	InvoiceNo    string
	InvoiceDate  time.Time
	DueDate      time.Time
	Items        []InvoiceEmailItem
	Subtotal     float64
	TaxRate      float64
	TaxAmount    float64
	TotalAmount  float64
	Description  string
	PaymentLink  string
}

type InvoiceEmailItem struct {
	Description string
	Quantity    float64
	UnitPrice   float64
	Amount      float64
}

func InvoiceTemplate(d InvoiceEmailData) string {
	var itemRows strings.Builder
	for _, item := range d.Items {
		itemRows.WriteString(fmt.Sprintf(`
			<tr>
				<td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#374151;font-size:14px;">%s</td>
				<td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#374151;font-size:14px;text-align:center;">%.0f</td>
				<td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#374151;font-size:14px;text-align:right;">₹%.2f</td>
				<td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#374151;font-size:14px;text-align:right;font-weight:500;">₹%.2f</td>
			</tr>`,
			item.Description, item.Quantity, item.UnitPrice, item.Amount,
		))
	}

	taxRow := ""
	if d.TaxAmount > 0 {
		taxRow = fmt.Sprintf(`
			<tr>
				<td colspan="2" style="padding:8px 16px;text-align:right;color:#6b7280;font-size:14px;">Tax (%.0f%%)</td>
				<td colspan="2" style="padding:8px 16px;text-align:right;color:#6b7280;font-size:14px;">₹%.2f</td>
			</tr>`, d.TaxRate, d.TaxAmount)
	}

	descriptionRow := ""
	if d.Description != "" {
		descriptionRow = fmt.Sprintf(`
			<tr>
				<td colspan="4" style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
					<span style="color:#6b7280;font-size:13px;">Note: %s</span>
				</td>
			</tr>`, d.Description)
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Invoice %s</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,sans-serif;">

<table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 16px;">
<tr><td align="center">
<table width="100%%" cellpadding="0" cellspacing="0" style="max-width:620px;">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#1a1a2e 0%%,#16213e 60%%,#0f3460 100%%);border-radius:12px 12px 0 0;padding:36px 40px;">
      <table width="100%%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <span style="background:#6366f1;border-radius:8px;padding:8px 14px;color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">P</span>
              <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;margin-left:8px;">PayFlow</span>
            </div>
          </td>
          <td align="right">
            <span style="background:rgba(99,102,241,0.2);color:#a5b4fc;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">Invoice</span>
          </td>
        </tr>
        <tr><td colspan="2" style="padding-top:24px;">
          <p style="margin:0;color:#e2e8f0;font-size:15px;">Hi <strong>%s</strong>,</p>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;line-height:1.6;">
            You have received an invoice. Please review the details below and complete your payment by the due date.
          </p>
        </td></tr>
      </table>
    </td>
  </tr>

  <!-- Invoice Meta -->
  <tr>
    <td style="background:#fff;padding:24px 40px 0;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <table width="100%%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:20px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:40px;">
                  <p style="margin:0;color:#9ca3af;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Invoice No.</p>
                  <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:600;">%s</p>
                </td>
                <td style="padding-right:40px;">
                  <p style="margin:0;color:#9ca3af;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Invoice Date</p>
                  <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:600;">%s</p>
                </td>
                <td>
                  <p style="margin:0;color:#9ca3af;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Due Date</p>
                  <p style="margin:4px 0 0;color:#ef4444;font-size:15px;font-weight:600;">%s</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td><hr style="border:none;border-top:1px solid #f0f0f0;margin:0 0 0 0;"/></td></tr>
      </table>
    </td>
  </tr>

  <!-- Line Items -->
  <tr>
    <td style="background:#fff;padding:0;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <table width="100%%" cellpadding="0" cellspacing="0">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Description</th>
            <th style="padding:10px 16px;text-align:center;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Qty</th>
            <th style="padding:10px 16px;text-align:right;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Unit Price</th>
            <th style="padding:10px 16px;text-align:right;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          %s
          %s
        </tbody>
      </table>
    </td>
  </tr>

  <!-- Totals -->
  <tr>
    <td style="background:#fff;padding:0 40px 0;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <table width="100%%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">
        <tr>
          <td style="padding:12px 0 4px;text-align:right;color:#6b7280;font-size:14px;">Subtotal</td>
          <td style="padding:12px 0 4px;text-align:right;color:#374151;font-size:14px;width:120px;">₹%.2f</td>
        </tr>
        %s
        <tr>
          <td style="padding:12px 0 16px;text-align:right;color:#111827;font-size:16px;font-weight:700;border-top:2px solid #e5e7eb;">Total Due</td>
          <td style="padding:12px 0 16px;text-align:right;color:#6366f1;font-size:18px;font-weight:800;border-top:2px solid #e5e7eb;">₹%.2f</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="background:#fff;padding:8px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <table width="100%%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="background:#f5f3ff;border-radius:10px;padding:24px;">
            <p style="margin:0 0 6px;color:#374151;font-size:14px;">Amount to pay</p>
            <p style="margin:0 0 20px;color:#111827;font-size:28px;font-weight:800;">₹%.2f</p>
            <a href="%s"
               style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
              Pay Now →
            </a>
            <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">Secure payment powered by Cashfree</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.8;">
        This invoice was sent via <strong style="color:#6366f1;">PayFlow</strong>.<br/>
        If you have questions, please contact the sender directly.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`,
		d.InvoiceNo,
		d.CustomerName,
		d.InvoiceNo,
		d.InvoiceDate.Format("02 Jan 2006"),
		d.DueDate.Format("02 Jan 2006"),
		itemRows.String(),
		descriptionRow,
		d.Subtotal,
		taxRow,
		d.TotalAmount,
		d.TotalAmount,
		d.PaymentLink,
	)
}
