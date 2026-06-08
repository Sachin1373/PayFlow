import api from "@/lib/axios";

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface CreateInvoicePayload {
  customer: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  invoice: {
    description: string;
    sub_total: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    due_date: string;
  };
  items: LineItem[];
}

export interface Invoice {
  invoice_id: string;
  invoice_no: string;
  customer_name: string;
  total_amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

export interface PaginatedInvoices {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
}

export interface InvoiceDetail {
  invoice_id: string;
  invoice_no: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  description: string;
  sub_total: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  due_date: string;
  created_at: string;
  items: LineItem[];
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export const getInvoices = async (params: GetInvoicesParams): Promise<PaginatedInvoices> => {
  const res = await api.get("/invoice/get", { params });
  return res.data;
};

export const createInvoice = async (payload: CreateInvoicePayload) => {
  const res = await api.post("/invoice/create", payload);
  return res.data;
};

export const getInvoiceById = async (id: string): Promise<InvoiceDetail> => {
  const res = await api.get(`/invoice/${id}`);
  return res.data;
};

export const sendInvoice = async (id: string): Promise<{ message: string }> => {
  const res = await api.post(`/invoice/send/${id}`);
  return res.data;
};
