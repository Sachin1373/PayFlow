import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  Clock,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getDashboardStats, type DashboardStats } from "@/services/dashboard.service";
import { fmtAmount } from "./invoices/utils";


const barChartConfig = {
  amount: {
    label: "Revenue",
    color: "oklch(72% .16 235)",
  },
} satisfies ChartConfig;

const donutChartConfig = {
  paid: { label: "Paid", color: "oklch(0.72 0.18 145)" },
  pending: { label: "Pending", color: "oklch(0.78 0.17 70)" },
  failed: { label: "Failed", color: "oklch(0.577 0.245 27.325)" },
} satisfies ChartConfig;


function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-success/15 text-success",
    PENDING: "bg-warning/15 text-warning",
    FAILED: "bg-destructive/15 text-destructive",
    EXPIRED: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}


function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted/40 ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <Skeleton className="h-4 w-28 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)}
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <Skeleton className="h-4 w-36 mb-4" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-64 mb-6" />
        <div className="flex items-center gap-8">
          <Skeleton className="w-48 h-48 rounded-full" />
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-24" />)}</div>
        </div>
      </div>
    </div>
  );
}


const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <p className="text-destructive text-sm">{error}</p>
    </div>
  );
  if (!stats) return null;

  const changeAbs = Math.abs(stats.revenue_change_percent);
  const changeUp = stats.revenue_change_percent >= 0;

  const pieData = [
    { name: "paid", value: stats.status_breakdown.paid },
    { name: "pending", value: stats.status_breakdown.pending },
    { name: "failed", value: stats.status_breakdown.failed },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          An overview of your payments across {stats.customers_count} customer{stats.customers_count !== 1 ? "s" : ""}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground">{fmtAmount(stats.total_revenue)}</p>
          <div className={`flex items-center gap-1 text-xs font-medium ${changeUp ? "text-success" : "text-destructive"}`}>
            {changeUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{changeAbs > 0 ? `${changeUp ? "+" : "-"}${changeAbs.toFixed(0)}% vs last month` : "No change vs last month"}</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Paid Invoices</p>
          <p className="text-2xl font-bold text-foreground">{stats.paid_invoices}</p>
          <div className="flex items-center gap-1 text-xs font-medium text-success">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Pending Invoices</p>
          <p className="text-2xl font-bold text-foreground">{stats.pending_invoices}</p>
          <div className="flex items-center gap-1 text-xs font-medium text-warning">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting payment</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Failed Payments</p>
          <p className="text-2xl font-bold text-foreground">{stats.failed_payments}</p>
          <div className="flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Needs attention</span>
          </div>
        </div>
      </div>

      {/* Recent Orders + Revenue chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_550px] gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <Link to="/orders" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
              View All <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Invoice", "Customer", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs font-medium text-muted-foreground pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {stats.recent_orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">No recent orders</td>
                  </tr>
                ) : stats.recent_orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 pr-4 font-medium text-foreground">{order.invoice_no}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{order.customer_name}</td>
                    <td className="py-3 pr-4 font-medium text-foreground">{fmtAmount(order.amount)}</td>
                    <td className="py-3 pr-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="py-3 text-muted-foreground">{order.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Revenue Last 7 Days</h2>
          {stats.revenue_last_7_days.length > 0 ? (
            <ChartContainer config={barChartConfig} className="h-[220px] w-full">
              <BarChart data={stats.revenue_last_7_days} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => v >= 1000 ? `₹${v / 1000}k` : `₹${v}`}
                  width={44}
                />
                <ChartTooltip
                  cursor={{ fill: "currentColor", fillOpacity: 0.05 }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [fmtAmount(Number(value)), "Revenue"]}
                    />
                  }
                />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">No revenue data</div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground">Payment Status Breakdown</h2>
        <p className="text-xs text-muted-foreground mt-0.5 mb-6">Distribution of orders by current status.</p>
        <div className="flex items-center gap-8 sm:flex-row sm:justify-center sm:gap-16">
          <ChartContainer config={donutChartConfig} className="h-[200px] w-[200px] shrink-0">
            <PieChart>
              <Tooltip
                content={
                  <ChartTooltipContent
                    nameKey="name"
                    formatter={(value, name) => [value, donutChartConfig[name as keyof typeof donutChartConfig]?.label ?? name]}
                  />
                }
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                strokeWidth={0}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex flex-col gap-4">
            {(Object.entries(donutChartConfig) as [string, { label: string; color: string }][]).map(([key, cfg]) => {
              const item = pieData.find((d) => d.name === key);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                  <span className="text-sm text-muted-foreground w-16">{cfg.label}</span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">{item?.value ?? 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
