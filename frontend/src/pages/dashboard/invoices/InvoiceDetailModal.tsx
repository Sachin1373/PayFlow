import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getInvoiceById, type InvoiceDetail } from "@/services/invoice.service";
import { StatusBadge } from "./StatusBadge";
import { fmtAmount, fmtDate } from "./utils";

export function InvoiceDetailModal({
  invoiceId,
  onClose,
}: {
  invoiceId: string | null;
  onClose: () => void;
}) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!invoiceId) {
      setInvoice(null);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    getInvoiceById(invoiceId)
      .then(setInvoice)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (!invoiceId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="p-12 text-center text-destructive">Failed to load invoice.</div>
        ) : invoice ? (
          <>
            {/* Sticky header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-foreground">{invoice.invoice_no}</h2>
                <StatusBadge status={invoice.status} />
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto p-6 flex flex-col gap-6">
              {/* Customer + Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">
                    Customer
                  </p>
                  <p className="font-semibold text-foreground">{invoice.customer_name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{invoice.customer_email}</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">
                    Details
                  </p>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-medium text-foreground">{fmtDate(invoice.due_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium text-foreground">{fmtDate(invoice.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax Rate</span>
                      <span className="font-medium text-foreground">{invoice.tax_rate}%</span>
                    </div>
                  </div>
                  {invoice.description && (
                    <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border/50">
                      {invoice.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 font-medium">
                  Line Items
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                          Description
                        </th>
                        <th className="text-right px-4 py-2.5 w-16 font-medium text-muted-foreground">
                          Qty
                        </th>
                        <th className="text-right px-4 py-2.5 w-32 font-medium text-muted-foreground">
                          Unit Price
                        </th>
                        <th className="text-right px-4 py-2.5 w-28 font-medium text-muted-foreground">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-2.5 text-foreground">{item.description}</td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2.5 text-right text-muted-foreground">
                            {fmtAmount(item.unit_price)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium">
                            {fmtAmount(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="ml-auto w-64 flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{fmtAmount(invoice.sub_total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax ({invoice.tax_rate}%)</span>
                  <span>{fmtAmount(invoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground text-base border-t border-border pt-2">
                  <span>Total</span>
                  <span>{fmtAmount(invoice.total_amount)}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
