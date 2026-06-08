import api from "@/lib/axios";

export interface Order {
  order_id: string;
  cf_link_id: string;
  invoice_id: string;
  invoice_no: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  payment_link: string;
  expires_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export const getOrders = async (params: GetOrdersParams): Promise<PaginatedOrders> => {
  const res = await api.get("/order/list", { params });
  return res.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const res = await api.get(`/order/${id}`);
  return res.data;
};
