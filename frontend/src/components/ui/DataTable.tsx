import { type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => ReactNode;
}

export interface PaginationConfig {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationConfig;
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found",
  pagination,
  rowKey,
}: DataTableProps<T>) {
  const colSpan = columns.length;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-4 py-3 font-medium text-muted-foreground ${col.headerClassName ?? ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="text-center py-16 text-muted-foreground">
                Loading…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="text-center py-16 text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-border/50 hover:bg-muted/10 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                    {col.render
                      ? col.render(row)
                      : String((row as unknown as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && <TablePagination {...pagination} />}
    </div>
  );
}

function TablePagination({ total, page, limit, onPageChange }: PaginationConfig) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/5">
      <span className="text-sm text-muted-foreground">
        {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 px-3 gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </Button>
        <span className="text-sm text-muted-foreground px-1">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 px-3 gap-1"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
