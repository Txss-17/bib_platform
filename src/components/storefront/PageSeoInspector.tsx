
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Search,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PageSeoInspectorProps {
  /** Visible uniquement pour le propriétaire de la boutique. */
  visible: boolean;
  /** Titre SEO sans le suffixe du site. */
  title: string;
  /** Description SEO. */
  description?: string | null;
  /** Image Open Graph. */
  ogImage?: string | null;
  /** URL canonique calculée par la page publique. */
  canonical?: string;
  /** Configuration internationale propre à la boutique. */
  activeLocales?: string[] | null;
  defaultLocale?: string | null;
  /** Type de page pour le libellé du panneau. */
  kind: "boutique" | "product";
}

type Status = "ok" | "warn" | "error";

interface Field {
  label: string;
  value: string;
  status: Status;
  hint?: string;
  copyKey?: string;
  copyValue?: string;
}

const SUPPORTED_LOCALES = ["fr", "en", "es", "de", "it"];

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

function classifyTitle(value: string): Status {
  if (!value.trim()) return "error";
  if (value.length < 20 || value.length > 65) return "warn";
  return "ok";
}

function classifyDescription(value?: string | null): Status {
  if (!value?.trim()) return "error";
  if (value.length < 50 || value.length > 165) return "warn";
  return "ok";
}

function classifyImage(value?: string | null): Status {
  return value?.trim() ? "ok" : "error";
}

function normalizeLocales(
  locales?: string[] | null,
  defaultLocale?: string | null,
): string[] {
  const valid = Array.isArray(locales)
    ? [...new Set(locales)].filter((locale) =>
        SUPPORTED_LOCALES.includes(locale),
      )
    : [];

  const active = valid.length > 0 ? valid : ["fr", "en"];

  const safeDefault =
    defaultLocale && active.includes(defaultLocale)
      ? defaultLocale
      : active[0];

  return [
    safeDefault,
    ...active.filter((locale) => locale !== safeDefault),
  ];
}

export function PageSeoInspector({
  visible,
  title,
  description,
  ogImage,
  canonical,
  activeLocales,
  defaultLocale,
  kind,
}: PageSeoInspectorProps) {
  const [open, setOpen] = useState(false);
  const [pathname, setPathname] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const locales = useMemo(
    () => normalizeLocales(activeLocales, defaultLocale),
    [activeLocales, defaultLocale],
  );

  const effectiveDefaultLocale = locales[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  const finalCanonical = useMemo(() => {
    if (canonical) return canonical;
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${pathname}`;
  }, [canonical, pathname]);

  const fields: Field[] = useMemo(
    () => [
      {
        label: "Title",
        value: title || "(vide)",
        status: classifyTitle(title),
        hint: `${title.length}/65 caractères`,
      },
      {
        label: "Meta description",
        value: description || "(vide)",
        status: classifyDescription(description),
        hint: `${description?.length ?? 0}/160 caractères`,
      },
      {
        label: "Image Open Graph",
        value: ogImage || "(absente)",
        status: classifyImage(ogImage),
        hint: ogImage
          ? "Aperçu social configuré"
          : "Sans image, pas d'aperçu social personnalisé",
        copyKey: ogImage ? "og-image" : undefined,
        copyValue: ogImage || undefined,
      },
      {
        label: "Canonique",
        value: finalCanonical || "(non définie)",
        status: finalCanonical ? "ok" : "warn",
        copyKey: finalCanonical ? "canonical" : undefined,
        copyValue: finalCanonical || undefined,
      },
      {
        label: "Langues SEO",
        value: locales.join(", "),
        status: locales.length >= 2 ? "ok" : "warn",
        hint:
          locales.length >= 2
            ? `${locales.length} langues configurées pour cette boutique`
            : "Une seule langue est configurée",
      },
      {
        label: "Langue par défaut",
        value: effectiveDefaultLocale,
        status: locales.includes(effectiveDefaultLocale) ? "ok" : "error",
        hint: "Utilisée comme valeur x-default",
      },
    ],
    [
      title,
      description,
      ogImage,
      finalCanonical,
      locales,
      effectiveDefaultLocale,
    ],
  );

  const handleCopy = async (value: string, key: string) => {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      toast.error("Copie indisponible dans ce navigateur.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success("Copié dans le presse-papiers", {
        description: value.slice(0, 60),
      });
    } catch {
      toast.error("Impossible de copier cette valeur.");
    }
  };

  useEffect(() => {
    if (!copiedKey) return;

    const timeout = window.setTimeout(() => {
      setCopiedKey(null);
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [copiedKey]);

  const errorCount = fields.filter(
    (field) => field.status === "error",
  ).length;

  const warningCount = fields.filter(
    (field) => field.status === "warn",
  ).length;

  const overall: Status =
    errorCount > 0
      ? "error"
      : warningCount > 0
        ? "warn"
        : "ok";

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:w-[360px]">
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          className="w-full justify-between gap-2 shadow-lg"
          size="sm"
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO de cette page
          </span>

          <Badge
            variant="outline"
            className={`text-[10px] ${
              overall === "ok"
                ? "border-emerald-400 bg-emerald-500/30 text-emerald-50"
                : overall === "warn"
                  ? "border-amber-300 bg-amber-500/30 text-amber-50"
                  : "border-red-300 bg-red-500/30 text-red-50"
            }`}
          >
            {overall === "ok"
              ? "OK"
              : `${errorCount + warningCount} à améliorer`}
          </Badge>
        </Button>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-secondary" />

              <p className="truncate text-sm font-display font-semibold text-foreground">
                SEO · {kind === "boutique" ? "Boutique" : "Produit"}
              </p>

              <Badge
                variant="outline"
                className={`text-[10px] ${
                  overall === "ok"
                    ? "border-emerald-500/40 text-emerald-600"
                    : overall === "warn"
                      ? "border-amber-500/40 text-amber-600"
                      : "border-red-500/40 text-red-600"
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
              aria-label="Réduire le panneau SEO"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
            {fields.map((field) => {
              const Icon = STATUS_ICON[field.status];

              return (
                <div
                  key={field.label}
                  className={`rounded-lg border px-2.5 py-2 ${STATUS_STYLES[field.status]}`}
                >
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide">
                      {field.label}
                    </span>

                    <span className="flex items-center gap-1.5 text-[10px] font-medium">
                      {field.copyKey && field.copyValue && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(field.copyValue!, field.copyKey!)
                          }
                          className="inline-flex items-center gap-0.5 rounded border border-current/30 px-1 py-0.5 transition hover:bg-background/40"
                          aria-label={`Copier ${field.label}`}
                        >
                          {copiedKey === field.copyKey ? (
                            <Check className="h-2.5 w-2.5" />
                          ) : (
                            <Copy className="h-2.5 w-2.5" />
                          )}
                          <span>
                            {copiedKey === field.copyKey ? "Copié" : "Copier"}
                          </span>
                        </button>
                      )}

                      <span className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {STATUS_LABEL[field.status]}
                      </span>
                    </span>
                  </div>

                  <p className="line-clamp-2 break-all text-xs text-foreground/90">
                    {field.value}
                  </p>

                  {field.hint && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {field.hint}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Visible uniquement par vous
            </span>

            <a
              href="/dashboard/seo-analytics"
              className="font-medium text-secondary hover:underline"
            >
              Ouvrir Analytics →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}