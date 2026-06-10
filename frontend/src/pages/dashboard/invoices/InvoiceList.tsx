import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { toast } from "sonner";
import { getInvoices, sendInvoice, type Invoice } from "@/services/invoice.service";
import { StatusBadge } from "./StatusBadge";
import { fmtDate, fmtAmount } from "./utils";
import { useDebounce } from "@/lib/utils";
import { InvoiceDetailModal } from "./InvoiceDetailModal";

interface CommittedFilters {
  search: string;
  status: string;
  fromDate: string;
  toDate: string;
}

const LIMIT = 10;

function makeColumns(
  onView: (id: string) => void,
  onSend: (id: string) => void,
  sendingId: string | null,
): Column<Invoice>[] {
  return [
    {
      key: "invoice_no",
      label: "Invoice No",
      className: "font-medium text-foreground",
    },
    { key: "customer_name", label: "Customer", className: "text-foreground" },
    {
      key: "total_amount",
      label: "Amount",
      className: "text-foreground",
      render: (inv) => fmtAmount(inv.total_amount),
    },
    {
      key: "status",
      label: "Status",
      render: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      key: "due_date",
      label: "Due Date",
      className: "text-muted-foreground",
      render: (inv) => fmtDate(inv.due_date),
    },
    {
      key: "created_at",
      label: "Created",
      className: "text-muted-foreground",
      render: (inv) => fmtDate(inv.created_at),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (inv) => {
        const s = inv.status.toUpperCase();
        const canSend = s === "DRAFT";
        const isSending = sendingId === inv.invoice_id;
        return (
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onView(inv.invoice_id)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View
            </button>
            {canSend && (
              <button
                onClick={() => onSend(inv.invoice_id)}
                disabled={isSending}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Sending…" : "Send"}
              </button>
            )}
          </div>
        );
      },
    },
  ];
}

export function InvoiceList({ onCreateClick }: { onCreateClick: () => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Draft filter state — only committed to the API when Apply is clicked
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const [filters, setFilters] = useState<CommittedFilters>({
    search: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const [viewId, setViewId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (f: CommittedFilters, p: number) => {
    setLoading(true);
    try {
      const res = await getInvoices({
        page: p,
        limit: LIMIT,
        ...(f.status && { status: f.status }),
        ...(f.search && { search: f.search }),
        ...(f.fromDate && { from_date: f.fromDate }),
        ...(f.toDate && { to_date: f.toDate }),
      });
      setInvoices(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSend = useCallback(async (id: string) => {
    setSendingId(id);
    try {
      await sendInvoice(id);
      toast.success("Invoice sent successfully");
      fetchInvoices(filters, page);
    } catch {
      toast.error("Failed to send invoice");
    } finally {
      setSendingId(null);
    }
  }, [fetchInvoices, filters, page]);

  const columns = useMemo(() => makeColumns(setViewId, handleSend, sendingId), [handleSend, sendingId]);

  useEffect(() => {
    fetchInvoices(filters, page);
  }, [fetchInvoices, filters, page]);

 useEffect(() => {
  setFilters((prev) => ({
    ...prev,
    search: debouncedSearch,
  }));
  setPage(1);
}, [debouncedSearch]);

const applyFilters = () => {
  setPage(1);
  setFilters({
    search: debouncedSearch,
    status: statusFilter,
    fromDate: fromDate ? fromDate.toISOString().slice(0, 10) : "",
    toDate: toDate ? toDate.toISOString().slice(0, 10) : "",
  });
};

const clearFilters = () => {
  setSearch("");
  setStatusFilter("");
  setFromDate(undefined);
  setToDate(undefined);
  setFilters({ search: "", status: "", fromDate: "", toDate: "" });
  setPage(1);
};

const hasActiveFilters = !!(filters.search || filters.status || filters.fromDate || filters.toDate);

  return (
    <>
    <div className="flex flex-col gap-5 flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total invoices</p>
        </div>
        <Button onClick={onCreateClick} size="lg" className="gap-2 px-4">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

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

        <Select value={statusFilter || "ALL"} onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}>
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

        <DatePicker value={fromDate} onChange={setFromDate} placeholder="From date" />
        <DatePicker value={toDate} onChange={setToDate} placeholder="To date" />

        <Button variant="outline" size="lg" onClick={applyFilters} className="h-9 px-4">
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="lg" onClick={clearFilters} className="h-9 px-3 text-muted-foreground hover:text-foreground gap-1.5">
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        )}
      </div>

      <DataTable<Invoice>
        columns={columns}
        data={invoices}
        loading={loading}
        emptyMessage="No invoices found"
        rowKey={(inv) => inv.invoice_id}
        pagination={{ total, page, limit: LIMIT, onPageChange: setPage }}
      />
    </div>

    <InvoiceDetailModal invoiceId={viewId} onClose={() => setViewId(null)} />
    </>
  );
}
