import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { toast } from "sonner";
import { getOrders, type Order } from "@/services/order.service";
import { OrderStatusBadge } from "./orders/OrderStatusBadge";
import { OrderDetailModal } from "./orders/OrderDetailModal";
import { fmtAmount, fmtDate } from "./invoices/utils";
import { useDebounce } from "@/lib/utils";

interface CommittedFilters {
  search: string;
  status: string;
  fromDate: string;
  toDate: string;
}

const LIMIT = 10;

function makeColumns(onViewDetails: (id: string) => void): Column<Order>[] {
  return [
    {
      key: "cf_link_id",
      label: "Order ID",
      className: "font-medium text-foreground",
    },
    {
      key: "invoice_no",
      label: "Invoice",
      render: (ord) => (
        <span className="text-primary font-medium">{ord.invoice_no}</span>
      ),
    },
    {
      key: "customer_name",
      label: "Customer",
      className: "text-foreground",
    },
    {
      key: "amount",
      label: "Amount",
      className: "text-foreground",
      render: (ord) => fmtAmount(ord.amount),
    },
    {
      key: "status",
      label: "Status",
      render: (ord) => <OrderStatusBadge status={ord.status} />,
    },
    {
      key: "method",
      label: "Method",
      className: "text-muted-foreground",
      render: (ord) => ord.method || "—",
    },
    {
      key: "created_at",
      label: "Created",
      className: "text-muted-foreground",
      render: (ord) => fmtDate(ord.created_at),
    },
    {
      key: "actions",
      label: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (ord) => (
        <button
          onClick={() => onViewDetails(ord.order_id)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View Details
        </button>
      ),
    },
  ];
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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
  const columns = useMemo(() => makeColumns(setViewId), []);

  const fetchOrders = useCallback(async (f: CommittedFilters, p: number) => {
    setLoading(true);
    try {
      const res = await getOrders({
        page: p,
        limit: LIMIT,
        ...(f.status && { status: f.status }),
        ...(f.search && { search: f.search }),
        ...(f.fromDate && { from_date: f.fromDate }),
        ...(f.toDate && { to_date: f.toDate }),
      });
      setOrders(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(filters, page);
  }, [fetchOrders, filters, page]);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === debouncedSearch) return prev;
      return { ...prev, search: debouncedSearch };
    });
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
            <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{total} orders processed.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8 h-9"
              placeholder="Search by Order ID or customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter || "ALL"} onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
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

        <DataTable<Order>
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders found"
          rowKey={(ord) => ord.order_id}
          pagination={{ total, page, limit: LIMIT, onPageChange: setPage }}
        />
      </div>

      <OrderDetailModal orderId={viewId} onClose={() => setViewId(null)} />
    </>
  );
};

export default OrdersPage;
