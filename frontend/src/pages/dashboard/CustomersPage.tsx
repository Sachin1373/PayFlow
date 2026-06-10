import { useEffect, useState, useCallback } from "react";
import { Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { toast } from "sonner";
import {
  getCustomers,
  createCustomer,
  type Customer,
  type CreateCustomerPayload,
} from "@/services/customer.service";
import { fmtAmount } from "./invoices/utils";
import { useDebounce } from "@/lib/utils";

const LIMIT = 10;

const COLUMNS: Column<Customer>[] = [
  { key: "name", label: "Name", className: "font-medium text-foreground" },
  { key: "email", label: "Email", className: "text-muted-foreground" },
  { key: "phone", label: "Phone", className: "text-muted-foreground" },
  {
    key: "total_invoices",
    label: "Total Invoices",
    className: "text-foreground",
    render: (c) => String(c.total_invoices),
  },
  {
    key: "total_paid",
    label: "Total Paid",
    className: "text-foreground",
    render: (c) => fmtAmount(c.total_paid),
  },
  {
    key: "last_invoice_date",
    label: "Last Invoice",
    className: "text-muted-foreground",
    render: (c) => c.last_invoice_date ?? "—",
  },
  {
    key: "actions",
    label: "Actions",
    headerClassName: "text-right",
    className: "text-right",
    render: () => (
      <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        View
      </button>
    ),
  },
];

const EMPTY_FORM: CreateCustomerPayload = { name: "", email: "", phone: "" };

const CustomerPage = () => {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateCustomerPayload>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<CreateCustomerPayload>>({});
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async (s: string, p: number) => {
    setLoading(true);
    try {
      const res = await getCustomers({ page: p, limit: LIMIT, ...(s && { search: s }) });
      setCustomerList(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  fetchCustomers(debouncedSearch, page);
}, [fetchCustomers, debouncedSearch, page]);


useEffect(() => {
  setPage(1);
}, [debouncedSearch]);


  const validateForm = (): boolean => {
    const errors: Partial<CreateCustomerPayload> = {};
    if (!form.name.trim()) errors.name = "Required";
    if (!form.email.trim()) errors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email";
    if (form.phone.trim().length !== 10) errors.phone = "Must be 10 digits";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await createCustomer(form);
      toast.success("Customer created");
      setShowModal(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      fetchCustomers(search, page);
    } catch {
      toast.error("Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  return (
    <div className="flex flex-col gap-5 flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} customers</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="lg" className="gap-2 px-4">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8 pr-8 h-9"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable<Customer>
        columns={COLUMNS}
        data={customerList}
        loading={loading}
        emptyMessage="No customers found"
        rowKey={(c) => c.id}
        pagination={{ total, page, limit: LIMIT, onPageChange: setPage }}
      />

      {/* Add Customer Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Add Customer</h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  className={formErrors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className={formErrors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {formErrors.email && (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={formErrors.phone ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {formErrors.phone && (
                  <p className="text-xs text-destructive">{formErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
              <Button variant="ghost" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "Save Customer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;
