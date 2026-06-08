import { Button } from "@/components/ui/button";
import type { CustomerForm, LineItemRow } from "./types";
import { fmtAmount } from "./utils";

export function ReviewStep({
  customer,
  items,
  taxRate,
  onBack,
  onSave,
  saving,
}: {
  customer: CustomerForm;
  items: LineItemRow[];
  taxRate: number;
  onBack: () => void;
  onSave: (asDraft: boolean) => void;
  saving: boolean;
}) {
  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const taxAmount = +(subtotal * (taxRate / 100)).toFixed(2);
  const total = +(subtotal + taxAmount).toFixed(2);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Customer</p>
          <p className="font-semibold text-foreground">{customer.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{customer.email}</p>
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Details</p>
          <p className="text-sm text-foreground">
            Due Date: <span className="font-medium">{customer.due_date}</span>
          </p>
          <p className="text-sm text-foreground mt-1">
            Tax Rate: <span className="font-medium">{taxRate}%</span>
          </p>
          {customer.description && (
            <p className="text-sm text-muted-foreground mt-1">{customer.description}</p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Description</th>
              <th className="text-right py-2 px-2 w-16 font-medium text-muted-foreground">Qty</th>
              <th className="text-right py-2 px-2 w-28 font-medium text-muted-foreground">Unit Price</th>
              <th className="text-right py-2 pl-2 w-28 font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="py-2 pr-3 text-foreground">{item.description || "—"}</td>
                <td className="py-2 px-2 text-right text-muted-foreground">{item.quantity}</td>
                <td className="py-2 px-2 text-right text-muted-foreground">{fmtAmount(item.unit_price)}</td>
                <td className="py-2 pl-2 text-right font-medium">{fmtAmount(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-64 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{fmtAmount(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax ({taxRate}%)</span>
          <span>{fmtAmount(taxAmount)}</span>
        </div>
        <div className="flex justify-between font-semibold text-foreground text-base border-t border-border pt-2">
          <span>Total</span>
          <span>{fmtAmount(total)}</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} size="lg" disabled={saving}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={() => onSave(true)} disabled={saving}>
            Save as Draft
          </Button>
          <Button size="lg" onClick={() => onSave(false)} disabled={saving} className="px-5">
            {saving ? "Saving…" : "Save & Generate Payment Link"}
          </Button>
        </div>
      </div>
    </div>
  );
}
