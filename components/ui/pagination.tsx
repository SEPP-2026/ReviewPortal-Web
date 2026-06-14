import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Optional total row count, shown in the summary line. */
  totalCount?: number;
  /** Disables the controls while a fetch is in flight. */
  isLoading?: boolean;
  className?: string;
}

/**
 * Reusable Prev/Next pager driven by server-side pagination metadata.
 * Renders nothing when there's a single page (or none).
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalCount,
  isLoading = false,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1 && !isLoading;
  const canNext = page < totalPages && !isLoading;

  const buttonClass =
    "inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700";

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-between gap-3 ${className ?? ""}`}
    >
      <p className="text-xs text-slate-500">
        Page <span className="font-medium text-slate-700">{page}</span> of{" "}
        {totalPages}
        {totalCount != null && (
          <>
            {" "}
            · <span className="font-medium text-slate-700">{totalCount}</span>{" "}
            total
          </>
        )}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          className={buttonClass}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          className={buttonClass}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
