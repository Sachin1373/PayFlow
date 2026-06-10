import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createInvoice } from "@/services/invoice.service";
import { InvoiceList } from "./invoices/InvoiceList";
import { StepIndicator } from "./invoices/StepIndicator";
import { CustomerStep } from "./invoices/CustomerStep";
import { LineItemsStep } from "./invoices/LineItemsStep";
import { ReviewStep } from "./invoices/ReviewStep";
import { type CustomerForm, type LineItemRow, emptyItem, INITIAL_CUSTOMER } from "./invoices/types";

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

  const handleSave = async () => {
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
          description: customer.description,
          sub_total: subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: total,
          due_date: customer.due_date,
        },
        items: items.map(({ description, quantity, unit_price, amount }) => ({
          description,
          quantity,
          unit_price,
          amount,
        })),
      });

      toast.success("Invoice created Successfully");
      backToList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create invoice";
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
        <h1 className="text-2xl font-semibold text-foreground">Create Invoice</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-6">
        <StepIndicator step={step} />
        <div className="border-t border-border" />

        {step === 1 && (
          <CustomerStep form={customer} onChange={setCustomer} onNext={() => setStep(2)} />
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
