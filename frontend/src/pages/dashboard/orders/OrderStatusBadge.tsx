const STATUS_STYLES: Record<string, string> = {
  PAID: "border border-success/40 text-success bg-success/10",
  PENDING: "border border-yellow-500/40 text-yellow-500 bg-yellow-500/10",
  FAILED: "border border-destructive/40 text-destructive bg-destructive/10",
  EXPIRED: "border border-border text-muted-foreground bg-muted/20",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[s] ?? "border border-border text-muted-foreground"}`}
    >
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
}
