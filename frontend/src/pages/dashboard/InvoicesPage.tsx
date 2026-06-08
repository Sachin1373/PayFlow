import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import {
  getInvoices,
  createInvoice,
  type Invoice,
  type LineItem,
} from "@/services/invoice.service";

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PAID: "border border-success/40 text-success bg-success/10",
  SENT: "border border-primary/40 text-primary bg-primary/10",
  DRAFT: "border border-border text-muted-foreground bg-muted/30",
  VOID: "border border-border text-muted-foreground bg-muted/20",
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[s] ?? "border border-border text-muted-foreground"}`}
    >
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toISOString().slice(0, 10);
}

function fmtAmount(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["Customer", "Line Items", "Review"];
  return (
    <div className="flex items-center w-full">
      {steps.map((label, i) => {
        const idx = i + 1;
        const active = idx === step;
        const done = idx < step;
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : active
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                }`}
              >
                {idx}
              </div>
              <span
                className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-primary" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-4 ${done ? "bg-primary/40" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Wizard form state ─────────────────────────────────────────────────────────

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  due_date: string;
  description: string;
}

interface LineItemRow extends LineItem {
  id: number;
}

function emptyItem(id: number): LineItemRow {
  return { id, description: "", quantity: 1, unit_price: 0, amount: 0 };
}

// ── Step 1: Customer ──────────────────────────────────────────────────────────

function CustomerStep({
  form,
  onChange,
  onNext,
}: {
  form: CustomerForm;
  onChange: (f: CustomerForm) => void;
  onNext: () => void;
}) {
  const set =
    (k: keyof CustomerForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [k]: e.target.value });

  const valid =
    form.name.trim() &&
    form.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.trim().length === 10 &&
    form.due_date;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Customer Name
        </label>
        <Input
          value={form.name}
          onChange={set("name")}
          placeholder="Full name"
          className="h-9"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Customer Email
        </label>
        <Input
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="email@example.com"
          className="h-9"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Customer Phone
        </label>
        <Input
          value={form.phone}
          onChange={set("phone")}
          placeholder="10 digits"
          maxLength={10}
          className="h-9"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Due Date</label>
        <Input
          type="date"
          value={form.due_date}
          onChange={set("due_date")}
          className="h-9"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          description (optional)
        </label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
          placeholder="Any additional notes..."
        />
      </div>

      <div>
        <Button onClick={onNext} disabled={!valid} size="lg" className="px-6">
          Next
        </Button>
      </div>
    </div>
  );
}

// ── Step 2: Line Items ────────────────────────────────────────────────────────

function LineItemsStep({
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
  const updateItem = (
    id: number,
    field: keyof LineItemRow,
    value: string | number,
  ) => {
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

  const valid = items.every(
    (it) => it.description.trim() && it.quantity > 0 && it.unit_price > 0,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                Description
              </th>
              <th className="text-left py-2 px-2 w-20 font-medium text-muted-foreground">
                Qty
              </th>
              <th className="text-left py-2 px-2 w-32 font-medium text-muted-foreground">
                Unit Price (₹)
              </th>
              <th className="text-right py-2 pl-2 w-28 font-medium text-muted-foreground">
                Amount
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="py-2 pr-3">
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    placeholder="Item description"
                    className="h-8"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", +e.target.value)
                    }
                    className="h-8"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="number"
                    min={0}
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(item.id, "unit_price", +e.target.value)
                    }
                    className="h-8"
                  />
                </td>
                <td className="py-2 pl-2 text-right font-medium">
                  {fmtAmount(item.amount)}
                </td>
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

// ── Step 3: Review ────────────────────────────────────────────────────────────

function ReviewStep({
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
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">
            Customer
          </p>
          <p className="font-semibold text-foreground">{customer.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {customer.email}
          </p>
          <p className="text-sm text-muted-foreground">{customer.phone}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">
            Details
          </p>
          <p className="text-sm text-foreground">
            Due Date: <span className="font-medium">{customer.due_date}</span>
          </p>
          <p className="text-sm text-foreground mt-1">
            Tax Rate: <span className="font-medium">{taxRate}%</span>
          </p>
          {customer.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {customer.description}
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-medium text-muted-foreground">
                Description
              </th>
              <th className="text-right py-2 px-2 w-16 font-medium text-muted-foreground">
                Qty
              </th>
              <th className="text-right py-2 px-2 w-28 font-medium text-muted-foreground">
                Unit Price
              </th>
              <th className="text-right py-2 pl-2 w-28 font-medium text-muted-foreground">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="py-2 pr-3 text-foreground">
                  {item.description || "—"}
                </td>
                <td className="py-2 px-2 text-right text-muted-foreground">
                  {item.quantity}
                </td>
                <td className="py-2 px-2 text-right text-muted-foreground">
                  {fmtAmount(item.unit_price)}
                </td>
                <td className="py-2 pl-2 text-right font-medium">
                  {fmtAmount(item.amount)}
                </td>
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
          <Button
            variant="outline"
            size="lg"
            onClick={() => onSave(true)}
            disabled={saving}
          >
            Save as Draft
          </Button>
          <Button
            size="lg"
            onClick={() => onSave(false)}
            disabled={saving}
            className="px-5"
          >
            {saving ? "Saving…" : "Save & Generate Payment Link"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Invoice List ──────────────────────────────────────────────────────────────

function InvoiceList({ onCreateClick }: { onCreateClick: () => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [page] = useState(1);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await getInvoices(params);
      setInvoices(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      inv.customer_name.toLowerCase().includes(q) ||
      inv.invoice_no.toLowerCase().includes(q);

    const createdAt = new Date(inv.created_at);
    const matchFrom = !fromDate || createdAt >= fromDate;
    const matchTo = !toDate || createdAt <= toDate;

    return matchSearch && matchFrom && matchTo;
  });

  return (
    <div className="flex flex-col gap-5 flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} total invoices
          </p>
        </div>
        <Button onClick={onCreateClick} size="lg" className="gap-2 px-4">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8 h-9"
            placeholder="Search by customer or invoice no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter || "ALL"}
          onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="VOID">Void</SelectItem>
          </SelectContent>
        </Select>

        <DatePicker
          value={fromDate}
          onChange={setFromDate}
          placeholder="From date"
        />

        <DatePicker
          value={toDate}
          onChange={setToDate}
          placeholder="To date"
        />

        <Button
          variant="outline"
          size="lg"
          onClick={fetchInvoices}
          className="h-9 px-4"
        >
          Apply Filters
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Invoice No
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Customer
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Amount
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Due Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Created
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-16 text-muted-foreground"
                >
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-16 text-muted-foreground"
                >
                  No invoices found
                </td>
              </tr>
            ) : (
              filtered.map((inv) => {
                const s = inv.status.toUpperCase();
                const canPay = s === "SENT" || s === "DRAFT";
                return (
                  <tr
                    key={inv.invoice_id}
                    className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {inv.invoice_no}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {inv.customer_name}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {fmtAmount(inv.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmtDate(inv.due_date)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmtDate(inv.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          View
                        </button>
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Send
                        </button>
                        {canPay && (
                          <Button size="xs" className="px-3">
                            Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const INITIAL_CUSTOMER: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  due_date: "",
  description: "",
};

const InvoicesPage = () => {
  const [view, setView] = useState<"list" | "create">("list");
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<CustomerForm>(INITIAL_CUSTOMER);
  const [items, setItems] = useState<LineItemRow[]>([emptyItem(1)]);
  const [taxRate, setTaxRate] = useState(18);
  const [saving, setSaving] = useState(false);

  const resetWizard = () => {
    setStep(1);
    setCustomer(INITIAL_CUSTOMER);
    setItems([emptyItem(Date.now())]);
    setTaxRate(18);
  };

  const openCreate = () => {
    resetWizard();
    setView("create");
  };

  const backToList = () => {
    setView("list");
    resetWizard();
  };

  const handleSave = async (asDraft: boolean) => {
    setSaving(true);
    try {
      const subtotal = items.reduce((s, it) => s + it.amount, 0);
      const taxAmount = +(subtotal * (taxRate / 100)).toFixed(2);
      const total = +(subtotal + taxAmount).toFixed(2);

      await createInvoice({
        customer: {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
        },
        invoice: {
          // description: items.map((it) => it.description).join(", "),
          sub_total: subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: total,
          due_date: customer.due_date,
          description: customer.description
        },
        items: items.map(({ description, quantity, unit_price, amount }) => ({
          description,
          quantity,
          unit_price,
          amount,
        })),
      });

      toast.success(
        asDraft
          ? "Invoice saved as draft"
          : "Invoice created & payment link generated",
      );
      backToList();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create invoice";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (view === "list") {
    return <InvoiceList onCreateClick={openCreate} />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <button
          onClick={backToList}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to invoices
        </button>
        <h1 className="text-2xl font-semibold text-foreground">
          Create Invoice
        </h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-6">
        <StepIndicator step={step} />

        <div className="border-t border-border" />

        {step === 1 && (
          <CustomerStep
            form={customer}
            onChange={setCustomer}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <LineItemsStep
            items={items}
            taxRate={taxRate}
            onItemsChange={setItems}
            onTaxRateChange={setTaxRate}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ReviewStep
            customer={customer}
            items={items}
            taxRate={taxRate}
            onBack={() => setStep(2)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
