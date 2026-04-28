import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiGridProps {
  children: ReactNode;
  /**
   * Number of KPI tiles per row at the `lg` breakpoint.
   * - 2: secondary surface (1 col mobile → 2 cols lg)
   * - 3: standard 3-up (1 col mobile → 3 cols md+)
   * - 4: primary dashboard 4-up (2 cols mobile → 4 cols lg) — the default.
   */
  cols?: 2 | 3 | 4;
  className?: string;
}

const COLS_CLASSES: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

/**
 * Standard KPI grid wrapper used everywhere on the dashboard. Guarantees
 * consistent spacing (`gap-3 sm:gap-4`) and bottom margin so individual pages
 * never re-define their own grid classes.
 */
export function KpiGrid({ children, cols = 4, className }: KpiGridProps) {
  return (
    <div
      className={cn("grid gap-3 sm:gap-4 mb-6", COLS_CLASSES[cols], className)}
      data-kpi-grid={cols}
    >
      {children}
    </div>
  );
}