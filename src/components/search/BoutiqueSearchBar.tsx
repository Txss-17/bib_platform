import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Loader2, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBoutiqueSearch } from "@/hooks/useBoutiqueSearch";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  placeholder?: string;
  /** Called when user picks a result. Defaults to navigation to boutique. */
  onPick?: (slug: string) => void;
  /** Compact variant (no shadow, smaller). */
  compact?: boolean;
}

export function BoutiqueSearchBar({
  className,
  placeholder = "Rechercher une boutique ou un produit…",
  onPick,
  compact,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: results = [], isFetching } = useBoutiqueSearch(query);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const submit = (slug?: string) => {
    if (slug) {
      if (onPick) onPick(slug);
      else navigate(`/boutique/${slug}`);
      setOpen(false);
      return;
    }
    if (query.trim().length >= 2) {
      navigate(`/store?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
        />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn("pl-9", compact ? "h-9" : "h-10")}
          aria-label="Rechercher une boutique"
        />
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-lg">
          {isFetching && results.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Recherche…
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Aucun résultat. Essayez un autre mot-clé.
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => submit(r.slug)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
                      {r.logo_url ? (
                        <img
                          src={r.logo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.tagline ?? r.category}
                      </p>
                      {r.matched_products.length > 0 && (
                        <p className="mt-1 truncate text-[11px] text-primary">
                          {r.matched_products.map((p) => p.name).join(" · ")}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
              <li className="border-t border-border/60 pt-1">
                <Link
                  to={`/store?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-center text-xs font-medium text-primary hover:bg-accent/50"
                >
                  Voir tous les résultats →
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}