import { useEffect, useState, type ChangeEvent } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { searchCustomers, type CustomerSearchResult } from "@/services/customer.service";
import type { CustomerForm } from "./types";

export function CustomerStep({
  form,
  onChange,
  onNext,
}: {
  form: CustomerForm;
  onChange: (f: CustomerForm) => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [selected, setSelected] = useState<CustomerSearchResult | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await searchCustomers(query);
        setResults(res);
      } catch {
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const selectCustomer = (c: CustomerSearchResult) => {
    setSelected(c);
    onChange({ ...form, name: c.name, email: c.email, phone: c.phone });
    setQuery("");
    setResults([]);
  };

  const clearSelection = () => {
    setSelected(null);
    onChange({ ...form, name: "", email: "", phone: "" });
  };

  const set =
    (k: keyof CustomerForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
          Select existing customer
          <span className="text-muted-foreground font-normal ml-1.5">(optional)</span>
        </label>

        {selected ? (
          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">{selected.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.email}</p>
            </div>
            <button
              onClick={clearSelection}
              className="ml-3 p-1 rounded text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8 h-9"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => setTimeout(() => setResults([]), 150)}
            />
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-muted/100 border border-border rounded-lg shadow-lg overflow-hidden">
                {results.map((c) => (
                  <button
                    key={c.id}
                    onMouseDown={() => selectCustomer(c)}
                    className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-center justify-between border-b border-border/50 last:border-0"
                  >
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or enter new customer details</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Customer Name</label>
        <Input value={form.name} onChange={set("name")} placeholder="Full name" className="h-9" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Customer Email</label>
        <Input
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="email@example.com"
          className="h-9"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Customer Phone</label>
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
        <DatePicker
          value={form.due_date ? new Date(form.due_date) : undefined}
          onChange={(date) => onChange({ ...form, due_date: date ? date.toISOString().slice(0, 10) : "" })}
          placeholder="Pick a due date"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Description
          <span className="text-muted-foreground font-normal ml-1.5">(optional)</span>
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
