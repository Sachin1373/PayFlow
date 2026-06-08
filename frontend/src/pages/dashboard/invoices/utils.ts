export function fmtDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toISOString().slice(0, 10);
}

export function fmtAmount(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
