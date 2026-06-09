import api from "@/lib/axios";

export interface DailyRevenue {
  day: string;
  amount: number;
}

export interface StatusBreakdown {
  paid: number;
  pending: number;
  failed: number;
}

export interface RecentOrder {
  order_id: string;
  invoice_no: string;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  total_revenue: number;
  paid_invoices: number;
  pending_invoices: number;
  failed_payments: number;
  customers_count: number;
  revenue_change_percent: number;
  revenue_last_7_days: DailyRevenue[];
  status_breakdown: StatusBreakdown;
  recent_orders: RecentOrder[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get<DashboardStats>("/dashboard/stats");
  return res.data;
}
