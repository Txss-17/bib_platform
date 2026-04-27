import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  /** Optional eyebrow label above the title (e.g. section name) */
  eyebrow?: string;
}

/**
 * Unified page header used across every dashboard page.
 * Provides: optional eyebrow + breadcrumbs, large display title,
 * supporting subtitle and a slot for primary actions.
 */
export function PageHeader({ title, subtitle, breadcrumbs, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      {(breadcrumbs?.length || eyebrow) && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
          {eyebrow && (
            <span className="uppercase tracking-[0.18em] text-secondary font-medium">
              {eyebrow}
            </span>
          )}
          {eyebrow && breadcrumbs?.length ? <span className="opacity-50">·</span> : null}
          {breadcrumbs?.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-3 h-3 opacity-50" />}
              {b.href ? (
                <Link to={b.href} className="hover:text-foreground transition-colors">
                  {b.label}
                </Link>
              ) : (
                <span>{b.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}