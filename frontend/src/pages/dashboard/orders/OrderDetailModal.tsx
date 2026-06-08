import { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { getOrderById, type Order } from "@/services/order.service";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { fmtAmount, fmtDate } from "../invoices/utils";

export function OrderDetailModal({
  orderId,
  onClose,
}: {
  orderId: string | null;
  onClose: () => void;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    getOrderById(orderId)
      .then(setOrder)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!orderId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-lg mx-4 flex flex-col">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="p-12 text-center text-destructive">Failed to load order.</div>
        ) : order ? (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-foreground">{order.cf_link_id}</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Amount highlight */}
              <div className="rounded-lg bg-muted/30 border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount</p>
                <p className="text-2xl font-bold text-foreground">{fmtAmount(order.amount)}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Invoice</p>
                  <p className="font-medium text-foreground">{order.invoice_no}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Customer</p>
                  <p className="font-medium text-foreground">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Method</p>
                  <p className="font-medium text-foreground">{order.method || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Currency</p>
                  <p className="font-medium text-foreground">{order.currency}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Created</p>
                  <p className="font-medium text-foreground">{fmtDate(order.created_at)}</p>
                </div>
                {order.expires_at && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Expires</p>
                    <p className="font-medium text-foreground">{fmtDate(order.expires_at)}</p>
                  </div>
                )}
                {order.paid_at && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Paid At</p>
                    <p className="font-medium text-success">{fmtDate(order.paid_at)}</p>
                  </div>
                )}
              </div>

              {/* Payment link */}
              {order.payment_link && (
                <a
                  href={order.payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors px-4 py-2.5 text-sm font-medium text-foreground"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Payment Link
                </a>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
