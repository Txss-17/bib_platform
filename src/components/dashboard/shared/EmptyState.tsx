import { ReactNode } from "react";
import { Inbox, ShieldOff, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmptyStateVariant = "no-content" | "no-results" | "forbidden";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /**
   * Visual variant. Provides sensible defaults for icon + tone so callers
   * stay consistent across the dashboard.
   * - `no-content` (default): nothing has been created yet (Inbox icon, neutral).
   * - `no-results`: a search/filter returned nothing (SearchX icon, neutral).
   * - `forbidden`: access denied (ShieldOff icon, destructive accent).
   */
  variant?: EmptyStateVariant;
}

const VARIANT_DEFAULTS: Record<
  EmptyStateVariant,
  { icon: ReactNode; iconBg: string }
> = {
  "no-content": {
    icon: <Inbox className="w-6 h-6" />,
    iconBg: "bg-secondary/10 text-secondary",
  },
  "no-results": {
    icon: <SearchX className="w-6 h-6" />,
    iconBg: "bg-muted text-muted-foreground",
  },
  forbidden: {
    icon: <ShieldOff className="w-6 h-6" />,
    iconBg: "bg-destructive/10 text-destructive",
  },
};

/**
 * Consistent empty-state used in every list/section when no data is available.
 * Use the `variant` prop to pick a default icon + tone, or pass a custom `icon`
 * to override.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "no-content",
}: EmptyStateProps) {
  const variantConfig = VARIANT_DEFAULTS[variant];
  const resolvedIcon = icon ?? variantConfig.icon;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-10 px-4",
        className,
      )}
      role="status"
      data-empty-variant={variant}
    >
      {resolvedIcon && (
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-3",
            variantConfig.iconBg,
          )}
        >
          {resolvedIcon}
        </div>
      )}
      <p className="font-display text-lg font-semibold text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Compact inline empty-state for tight UI surfaces (Select dropdowns,
 * popovers, table footers) where the full <EmptyState> would feel too heavy.
 * Keeps the same semantic tokens for consistency.
 */
export function EmptyStateInline({
  icon,
  title,
  variant = "no-content",
  className,
}: {
  icon?: ReactNode;
  title: string;
  variant?: EmptyStateVariant;
  className?: string;
}) {
  const resolvedIcon = icon ?? VARIANT_DEFAULTS[variant].icon;
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
      role="status"
      data-empty-variant={variant}
    >
      <span className="opacity-70 [&_svg]:w-3.5 [&_svg]:h-3.5">{resolvedIcon}</span>
      <span>{title}</span>
    </div>
  );
}