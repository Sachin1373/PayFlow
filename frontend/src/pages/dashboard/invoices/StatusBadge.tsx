const STATUS_STYLES: Record<string, string> = {
  PAID: "border border-success/40 text-success bg-success/10",
  SENT: "border border-primary/40 text-primary bg-primary/10",
  DRAFT: "border border-border text-muted-foreground bg-muted/30",
  VOID: "border border-border text-muted-foreground bg-muted/20",
};

export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[s] ?? "border border-border text-muted-foreground"}`}
    >
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
}
