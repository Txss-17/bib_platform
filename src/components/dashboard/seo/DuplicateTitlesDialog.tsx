import { useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Copy, Check, Wand2, Store, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface BoutiqueLite {
  id: string;
  name: string;
  category?: string | null;
  tagline?: string | null;
}
interface ProductLite {
  id: string;
  boutique_id: string;
  name: string;
  category?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boutiques: BoutiqueLite[];
  products: ProductLite[];
}

/**
 * Build a unique title from a template, deduplicating against existing titles
 * by appending a counter when needed. Templates use {name}, {category}, {boutique}.
 */
function applyTemplate(
  template: string,
  vars: Record<string, string | undefined | null>,
) {
  return template
    .replace(/\{name\}/g, vars.name || "")
    .replace(/\{category\}/g, vars.category || "")
    .replace(/\{boutique\}/g, vars.boutique || "")
    .replace(/\s+/g, " ")
    .replace(/\s—\s$/, "")
    .trim();
}

export function DuplicateTitlesDialog({
  open, onOpenChange, boutiques, products,
}: Props) {
  const qc = useQueryClient();
  const [boutiqueTemplate, setBoutiqueTemplate] = useState("{name} — {category}");
  const [productTemplate, setProductTemplate] = useState(
    "{name} — {boutique}",
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Detect duplicate titles
  const { duplicateBoutiques, duplicateProducts } = useMemo(() => {
    const bMap = new Map<string, BoutiqueLite[]>();
    for (const b of boutiques) {
      const key = (b.name || "").trim().toLowerCase();
      if (!key) continue;
      bMap.set(key, [...(bMap.get(key) ?? []), b]);
    }
    const pMap = new Map<string, ProductLite[]>();
    for (const p of products) {
      const key = (p.name || "").trim().toLowerCase();
      if (!key) continue;
      pMap.set(key, [...(pMap.get(key) ?? []), p]);
    }
    return {
      duplicateBoutiques: [...bMap.values()].filter((arr) => arr.length > 1).flat(),
      duplicateProducts: [...pMap.values()].filter((arr) => arr.length > 1).flat(),
    };
  }, [boutiques, products]);

  // Generate suggestions
  const boutiqueSuggestions = useMemo(() => {
    const taken = new Set<string>();
    return duplicateBoutiques.map((b) => {
      let candidate = applyTemplate(boutiqueTemplate, {
        name: b.name,
        category: b.category,
      });
      let i = 2;
      const baseLower = candidate.toLowerCase();
      while (taken.has(candidate.toLowerCase())) {
        candidate = `${applyTemplate(boutiqueTemplate, {
          name: b.name,
          category: b.category,
        })} ${i}`;
        i++;
      }
      taken.add(candidate.toLowerCase());
      return { id: b.id, currentName: b.name, suggested: candidate };
    });
  }, [duplicateBoutiques, boutiqueTemplate]);

  const productSuggestions = useMemo(() => {
    return duplicateProducts.map((p) => {
      const boutique = boutiques.find((b) => b.id === p.boutique_id);
      const suggested = applyTemplate(productTemplate, {
        name: p.name,
        category: p.category,
        boutique: boutique?.name,
      });
      return { id: p.id, currentName: p.name, suggested };
    });
  }, [duplicateProducts, productTemplate, boutiques]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    });
  };

  const toggleAllBoutiques = (checked: boolean) => {
    const next = { ...selected };
    boutiqueSuggestions.forEach((s) => (next[`b:${s.id}`] = checked));
    setSelected(next);
  };

  const selectedBoutiqueIds = boutiqueSuggestions
    .filter((s) => selected[`b:${s.id}`])
    .map((s) => s.id);

  const handleApply = async () => {
    const targets = boutiqueSuggestions.filter((s) =>
      selectedBoutiqueIds.includes(s.id),
    );
    if (targets.length === 0) {
      toast.error("Sélectionnez au moins une boutique à renommer");
      return;
    }
    setApplying(true);
    let success = 0;
    let failed = 0;
    for (const t of targets) {
      const { error } = await supabase
        .from("boutiques")
        .update({ name: t.suggested })
        .eq("id", t.id);
      if (error) failed++;
      else success++;
    }
    setApplying(false);
    if (success > 0) {
      toast.success(`${success} boutique(s) renommée(s)`, {
        description:
          failed > 0 ? `${failed} échec(s) — vérifiez vos permissions.` : undefined,
      });
      qc.invalidateQueries({ queryKey: ["boutiques"] });
      qc.invalidateQueries({ queryKey: ["seo-products"] });
      setSelected({});
      onOpenChange(false);
    } else {
      toast.error("Aucune boutique n'a pu être renommée");
    }
  };

  const totalDup = boutiqueSuggestions.length + productSuggestions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-secondary" />
            Corriger les titres dupliqués en masse
          </DialogTitle>
          <DialogDescription>
            {totalDup === 0
              ? "Aucun doublon détecté pour l'instant. Bravo !"
              : `${totalDup} page(s) partagent leur titre avec d'autres. Générez des titres uniques avec un template, puis appliquez en une fois.`}
          </DialogDescription>
        </DialogHeader>

        {totalDup > 0 && (
          <>
            {/* Boutique templates */}
            {boutiqueSuggestions.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-secondary" />
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Boutiques en doublon ({boutiqueSuggestions.length})
                  </h3>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Template (variables : {"{name} {category}"})
                  </label>
                  <Input
                    value={boutiqueTemplate}
                    onChange={(e) => setBoutiqueTemplate(e.target.value)}
                    placeholder="{name} — {category}"
                  />
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <Checkbox
                    id="select-all-b"
                    checked={
                      selectedBoutiqueIds.length === boutiqueSuggestions.length &&
                      boutiqueSuggestions.length > 0
                    }
                    onCheckedChange={(c) => toggleAllBoutiques(Boolean(c))}
                  />
                  <label htmlFor="select-all-b" className="text-xs text-muted-foreground">
                    Tout sélectionner
                  </label>
                </div>
                <div className="rounded-xl border border-border divide-y divide-border max-h-60 overflow-y-auto">
                  {boutiqueSuggestions.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 p-2.5">
                      <Checkbox
                        checked={!!selected[`b:${s.id}`]}
                        onCheckedChange={(c) =>
                          setSelected({ ...selected, [`b:${s.id}`]: Boolean(c) })
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-muted-foreground line-through truncate">
                          {s.currentName}
                        </p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {s.suggested}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {s.suggested.length} car.
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Product suggestions (manual copy — supplier_products is read-only) */}
            {productSuggestions.length > 0 && (
              <section className="space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-secondary" />
                  <h3 className="font-display font-semibold text-sm text-foreground">
                    Produits en doublon ({productSuggestions.length})
                  </h3>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-2.5 text-[11px] text-foreground/80">
                  Les noms produits proviennent du catalogue fournisseur (lecture
                  seule). Copiez le titre suggéré et utilisez-le dans la
                  description ou les meta de votre boutique pour les différencier.
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Template (variables : {"{name} {boutique} {category}"})
                  </label>
                  <Input
                    value={productTemplate}
                    onChange={(e) => setProductTemplate(e.target.value)}
                    placeholder="{name} — {boutique}"
                  />
                </div>
                <div className="rounded-xl border border-border divide-y divide-border max-h-60 overflow-y-auto">
                  {productSuggestions.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-muted-foreground line-through truncate">
                          {s.currentName}
                        </p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {s.suggested}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleCopy(s.suggested, `p:${s.id}`)}
                      >
                        {copiedKey === `p:${s.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {boutiqueSuggestions.length > 0 && (
            <Button
              onClick={handleApply}
              disabled={applying || selectedBoutiqueIds.length === 0}
              className="gap-2"
            >
              {applying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Appliquer ({selectedBoutiqueIds.length})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
