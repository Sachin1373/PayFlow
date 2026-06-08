package email

import "fmt"

func InvoiceCreatedTemplate(
	customerName string,
	invoiceNo string,
	amount float64,
) string {

	return fmt.Sprintf(`
		<h2>Invoice Created</h2>

		<p>Hello %s,</p>

		<p>You have received a new invoice.</p>

		<p>
			Invoice No: <b>%s</b><br/>
			Amount: ₹%.2f
		</p>

		<p>Thank you for using PayFlow.</p>
	`,
		customerName,
		invoiceNo,
		amount,
	)
}
