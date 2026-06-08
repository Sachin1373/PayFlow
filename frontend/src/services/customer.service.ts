import api from "@/lib/axios";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_invoices: number;
  total_paid: number;
  last_invoice_date: string | null;
}

export interface CustomerSearchResult {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone: string;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

export const getCustomers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedCustomers> => {
  const res = await api.get("/customer/list", { params });
  return res.data;
};

export const createCustomer = async (payload: CreateCustomerPayload): Promise<Customer> => {
  const res = await api.post("/customer/create", payload);
  return res.data;
};

export const searchCustomers = async (q: string): Promise<CustomerSearchResult[]> => {
  const res = await api.get("/customer/search", { params: { q } });
  return res.data;
};
