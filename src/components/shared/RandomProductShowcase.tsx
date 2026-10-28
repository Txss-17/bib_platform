import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

export interface ShowcaseItem {
  id: string;
  name: string;
  imageUrl: string | null;
  priceLabel: string;
  detail?: string;
  href?: string;
}

interface Props {
  items: ShowcaseItem[];
  intervalMs?: number;
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Single-card showcase that cycles through products in random order
 * (no list). Reshuffles after each full pass.
 */
export function RandomProductShowcase({ items, intervalMs = 3500 }: Props) {
  const key = items.map((i) => i.id).join("|");
  const [order, setOrder] = useState<ShowcaseItem[]>(() => shuffle(items));
  const [index, setIndex] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setOrder(shuffle(items)); setIndex(0); }, [key]);

  useEffect(() => {
    if (order.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => {
        if (i + 1 >= order.length) {
          setOrder((o) => shuffle(o));
          return 0;
        }
        return i + 1;
      });
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [order.length, intervalMs]);

  const item = useMemo(() => order[index] ?? order[0], [order, index]);
  if (!item) return null;

  const body = (
    <article
      key={item.id}
      className="animate-fade-in overflow-hidden rounded-xl border border-border/70 bg-card transition-colors hover:bg-muted/30"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.name}</p>
        <p className="mt-1 text-xs font-semibold text-primary">{item.priceLabel}</p>
        {item.detail && (
          <p className="mt-1 text-[11px] text-muted-foreground">{item.detail}</p>
        )}
      </div>
    </article>
  );

  return (
    <div aria-live="polite">
      {item.href ? <Link to={item.href}>{body}</Link> : body}
    </div>
  );
}
