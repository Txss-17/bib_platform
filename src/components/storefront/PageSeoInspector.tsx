import { useEffect, useMemo, useState } from "react";
import { Check, AlertTriangle, X, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSeoSettings } from "@/lib/seoSettings";

interface PageSeoInspectorProps {
  /** Visible only when true (typically: viewer is the boutique owner). */
  visible: boolean;
  /** Title used by useSEO (without site suffix). */
  title: string;
  /** Meta description used by useSEO. */
  description?: string | null;
  /** Open Graph image used by useSEO. */
  ogImage?: string | null;
  /** Optional explicit canonical override (else uses location). */
  canonical?: string;
  /** Page kind, only used for the dock label. */
  kind: "boutique" | "product";
}

type Status = "ok" | "warn" | "error";

interface Field {
  label: string;
  value: string;
  status: Status;
  hint?: string;
}

const STATUS_STYLES: Record<Status, string> = {
  ok: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  warn: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  error: "text-red-600 bg-red-500/10 border-red-500/30",
};

const STATUS_ICON: Record<Status, typeof Check> = {
  ok: Check,
  warn: AlertTriangle,
  error: X,
};

const STATUS_LABEL: Record<Status, string> = {
  ok: "OK",
  warn: "À améliorer",
  error: "À corriger",
};

function classifyTitle(t: string): Status {
  if (!t || t.trim().length === 0) return "error";
  if (t.length < 20 || t.length > 65) return "warn";
  return "ok";
}
function classifyDesc(d?: string | null): Status {
  if (!d || d.trim().length === 0) return "error";
  if (d.length < 50 || d.length > 165) return "warn";
  return "ok";
}
function classifyImage(url?: string | null): Status {
  return url && url.length > 0 ? "ok" : "error";
}

export function PageSeoInspector({
  visible,
  title,
  description,
  ogImage,
  canonical,
  kind,
}: PageSeoInspectorProps) {
  const { settings } = useSeoSettings();
  const [open, setOpen] = useState(false);
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setPathname(window.location.pathname);
  }, []);

  const finalCanonical = useMemo(() => {
    if (canonical) return canonical;
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${pathname}`;
  }, [canonical, pathname]);

  const fields: Field[] = useMemo(() => {
    return [
      {
        label: "Title",
        value: title || "(vide)",
        status: classifyTitle(title),
        hint: `${title?.length ?? 0}/65 caractères`,
      },
      {
        label: "Meta description",
        value: description || "(vide)",
        status: classifyDesc(description),
        hint: `${description?.length ?? 0}/160 caractères`,
      },
      {
        label: "Image Open Graph",
        value: ogImage || "(absente)",
        status: classifyImage(ogImage),
        hint: ogImage ? "Aperçu social actif" : "Sans image, pas d'aperçu social",
      },
      {
        label: "Canonique",
        value: finalCanonical || "(non définie)",
        status: finalCanonical ? "ok" : "warn",
      },
      {
        label: "Hreflang",
        value: `${settings.activeLocales.join(", ")} · x-default → ${settings.defaultLocale}`,
        status: settings.activeLocales.length >= 2 ? "ok" : "warn",
        hint:
          settings.activeLocales.length >= 2
            ? `${settings.activeLocales.length} locales actives`
            : "Activez ≥ 2 locales pour cibler l'international",
      },
    ];
  }, [title, description, ogImage, finalCanonical, settings]);

  const errorCount = fields.filter((f) => f.status === "error").length;
  const warnCount = fields.filter((f) => f.status === "warn").length;
  const overall: Status =
    errorCount > 0 ? "error" : warnCount > 0 ? "warn" : "ok";

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-[360px]">
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          className="w-full justify-between gap-2 shadow-lg"
          size="sm"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            SEO de cette page
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              overall === "ok"
                ? "border-emerald-400 text-emerald-50 bg-emerald-500/30"
                : overall === "warn"
                ? "border-amber-300 text-amber-50 bg-amber-500/30"
                : "border-red-300 text-red-50 bg-red-500/30"
            }`}
          >
            {overall === "ok"
              ? "OK"
              : `${errorCount + warnCount} à corriger`}
          </Badge>
        </Button>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-secondary shrink-0" />
              <p className="text-sm font-display font-semibold text-foreground truncate">
                SEO · {kind === "boutique" ? "Boutique" : "Produit"}
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  overall === "ok"
                    ? "text-emerald-600 border-emerald-500/40"
                    : overall === "warn"
                    ? "text-amber-600 border-amber-500/40"
                    : "text-red-600 border-red-500/40"
                }`}
              >
                {STATUS_LABEL[overall]}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setOpen(false)}
              aria-label="Réduire"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
            {fields.map((f) => {
              const Icon = STATUS_ICON[f.status];
              return (
                <div
                  key={f.label}
                  className={`rounded-lg border px-2.5 py-2 ${STATUS_STYLES[f.status]}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide">
                      {f.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-medium">
                      <Icon className="w-3 h-3" />
                      {STATUS_LABEL[f.status]}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 break-all line-clamp-2">
                    {f.value}
                  </p>
                  {f.hint && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {f.hint}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-3 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> Visible uniquement par vous
            </span>
            <a
              href="/dashboard/seo-analytics"
              className="text-secondary hover:underline font-medium"
            >
              Ouvrir Analytics →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
