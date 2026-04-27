import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Removes the inner content padding (useful for tables/charts) */
  flush?: boolean;
}

/**
 * Standard surface used for every dashboard section.
 * Premium ivory background, subtle marine border, consistent radius.
 */
export function SectionCard({
  title,
  description,
  icon,
  actions,
  children,
  className,
  contentClassName,
  flush,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border/60 shadow-sm rounded-2xl overflow-hidden",
        className,
      )}
    >
      {(title || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <div className="flex items-start gap-3 min-w-0">
            {icon && (
              <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <CardTitle className="text-base sm:text-lg font-display font-semibold text-foreground">
                  {title}
                </CardTitle>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(flush ? "p-0" : "pt-2", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}