import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type LineItemRow, emptyItem } from "./types";
import { fmtAmount } from "./utils";

export function LineItemsStep({
  items,
  taxRate,
  onItemsChange,
  onTaxRateChange,
  onNext,
  onBack,
}: {
  items: LineItemRow[];
  taxRate: number;
  onItemsChange: (items: LineItemRow[]) => void;
  onTaxRateChange: (r: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const updateItem = (id: number, field: keyof LineItemRow, value: string | number) => {
    onItemsChange(
      items.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        updated.amount = +(updated.quantity * updated.unit_price).toFixed(2);
        return updated;
      }),
    );
  };

  const addItem = () => onItemsChange([...items, emptyItem(Date.now())]);

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    onItemsChange(items.filter((it) => it.id !== id));
  };

  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const taxAmount = +(subtotal * (taxRate / 100)).toFixed(2);
  const total = +(subtotal + taxAmount).toFixed(2);

  const valid = items.every((it) => it.description.trim() && it.quantity > 0 && it.unit_price > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left py-2 px-2 w-20 font-medium text-muted-foreground">Qty</th>
              <th className="text-left py-2 px-2 w-32 font-medium text-muted-foreground">Unit Price (₹)</th>
              <th className="text-right py-2 pl-2 w-28 font-medium text-muted-foreground">Amount</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="py-2 pr-3">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Item description"
                    className="h-8"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", +e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="number"
                    min={0}
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.id, "unit_price", +e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="py-2 pl-2 text-right font-medium">{fmtAmount(item.amount)}</td>
                <td className="py-2 pl-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors w-fit"
      >
        <Plus className="w-4 h-4" />
        Add Item
      </button>

      <div className="border-t border-border pt-4 ml-auto w-72 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{fmtAmount(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Tax %</span>
          <Input
            type="number"
            min={0}
            max={100}
            value={taxRate}
            onChange={(e) => onTaxRateChange(+e.target.value)}
            className="h-7 w-20 text-right"
          />
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax Amount</span>
          <span>{fmtAmount(taxAmount)}</span>
        </div>
        <div className="flex justify-between font-semibold text-foreground text-base border-t border-border pt-2">
          <span>Total</span>
          <span>{fmtAmount(total)}</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} size="lg">
          Back
        </Button>
        <Button onClick={onNext} disabled={!valid} size="lg" className="px-6">
          Next
        </Button>
      </div>
    </div>
  );
}
