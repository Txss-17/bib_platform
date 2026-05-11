import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useProductMedia,
  useGenerateProductMedia,
  useToggleProductMedia,
  useDeleteProductMedia,
} from "@/hooks/useProductMedia";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  boutiqueId: string;
  productName: string;
  /** Default prompt seed — usually product description / category. */
  defaultPrompt?: string;
}

/**
 * AI image studio for a single product.
 * Generates up to 4 brand-aware visuals per call. The seller picks one or
 * several to use on the storefront product page.
 */
export function ProductMediaDialog({
  open,
  onOpenChange,
  productId,
  boutiqueId,
  productName,
  defaultPrompt,
}: Props) {
  const [prompt, setPrompt] = useState(
    defaultPrompt ||
      `Mise en scène premium du produit « ${productName} », sans texte, ambiance lifestyle.`,
  );

  const { data: media = [], isLoading } = useProductMedia(productId);
  const generate = useGenerateProductMedia();
  const toggle = useToggleProductMedia();
  const remove = useDeleteProductMedia();

  const selectedCount = media.filter((m) => m.is_selected).length;

  const handleGenerate = async () => {
    if (prompt.trim().length < 6) {
      toast.error("Décrivez la scène souhaitée en quelques mots.");
      return;
    }
    try {
      const created = await generate.mutateAsync({
        productId,
        boutiqueId,
        prompt: prompt.trim(),
        count: 4,
      });
      toast.success(`${created.length} variantes générées — choisissez celles à publier.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Génération impossible";
      if (msg.includes("rate_limited")) {
        toast.error("Trop de demandes — réessayez dans quelques instants.");
      } else if (msg.includes("credits_exhausted")) {
        toast.error("Crédits IA épuisés sur votre espace.");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-bib-gold" />
            Studio visuels — {productName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Générez jusqu'à 4 visuels cohérents avec votre marque, puis sélectionnez
            ceux à afficher sur la fiche produit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prompt + generate */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Brief créatif</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Ex: Le produit posé sur du marbre, lumière dorée du matin, décor minimaliste"
              className="text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                L'IA respecte automatiquement votre identité (palette, ton, ambiance).
              </p>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={generate.isPending}
                className="gap-1.5"
              >
                {generate.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Génération…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Générer 4 variantes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-foreground">
                Bibliothèque ({media.length})
              </h4>
              {selectedCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""} sur la fiche
                </Badge>
              )}
            </div>

            {isLoading ? (
              <p className="text-xs text-muted-foreground">Chargement…</p>
            ) : media.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Aucun visuel pour l'instant. Générez votre première série pour démarrer.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {media.map((m) => (
                  <div
                    key={m.id}
                    className={`relative group rounded-lg overflow-hidden border-2 transition ${
                      m.is_selected
                        ? "border-bib-gold ring-2 ring-bib-gold/30"
                        : "border-border hover:border-bib-gold/50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggle.mutate({
                          mediaId: m.id,
                          productId,
                          isSelected: !m.is_selected,
                        })
                      }
                      className="block w-full aspect-[4/5] bg-muted"
                      title={m.is_selected ? "Retirer de la fiche" : "Ajouter à la fiche"}
                    >
                      <img
                        src={m.url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>

                    {m.is_selected && (
                      <div className="absolute top-1.5 left-1.5 bg-bib-gold text-bib-marine rounded-full p-1 shadow">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm("Supprimer ce visuel ?")) return;
                        remove.mutate({ mediaId: m.id, productId });
                      }}
                      className="absolute top-1.5 right-1.5 bg-background/90 backdrop-blur rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:text-destructive"
                      title="Supprimer"
                      aria-label="Supprimer ce visuel"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}