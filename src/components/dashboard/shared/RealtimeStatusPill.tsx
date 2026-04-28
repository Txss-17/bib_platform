import { Loader2, RefreshCcw, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type RealtimeStatus =
  | "loading"
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline";

interface Props {
  status: RealtimeStatus;
  className?: string;
}

const MAP: Record<
  RealtimeStatus,
  { label: string; dotClass: string; pillClass: string; Icon?: React.ElementType }
> = {
  loading: {
    label: "Chargement…",
    dotClass: "bg-muted-foreground/50",
    pillClass: "bg-muted text-muted-foreground",
    Icon: Loader2,
  },
  connecting: {
    label: "Connexion…",
    dotClass: "bg-warning animate-pulse",
    pillClass: "bg-warning/10 text-warning",
    Icon: Loader2,
  },
  reconnecting: {
    label: "Reconnexion…",
    dotClass: "bg-warning animate-pulse",
    pillClass: "bg-warning/10 text-warning",
    Icon: RefreshCcw,
  },
  live: {
    label: "Live",
    dotClass: "bg-success animate-pulse",
    pillClass: "bg-success/10 text-success",
  },
  offline: {
    label: "Hors-ligne",
    dotClass: "bg-muted-foreground/50",
    pillClass: "bg-muted text-muted-foreground",
    Icon: WifiOff,
  },
};

/**
 * Shared lifecycle pill for any realtime widget (Pulse, Order feed, Stock).
 */
export function RealtimeStatusPill({ status, className }: Props) {
  const cfg = MAP[status];
  const Icon = cfg.Icon;
  const spin =
    status === "loading" || status === "connecting" || status === "reconnecting";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
        cfg.pillClass,
        className,
      )}
    >
      {Icon ? (
        <Icon className={cn("w-3 h-3", spin && "animate-spin")} />
      ) : (
        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotClass)} />
      )}
      {cfg.label}
    </span>
  );
}
