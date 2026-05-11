import { useMemo, useState } from "react";
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
import { Loader2, Sparkles, Check, Trash2, Star, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  useProductMedia,
  useGenerateProductMedia,
  useToggleProductMedia,
  useDeleteProductMedia,
  useReorderProductMedia,
  useSetPrimaryProductMedia,
  type ProductMedia,
} from "@/hooks/useProductMedia";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  const reorder = useReorderProductMedia();
  const setPrimary = useSetPrimaryProductMedia();

  const selected = useMemo(() => media.filter((m) => m.is_selected), [media]);
  const unselected = useMemo(() => media.filter((m) => !m.is_selected), [media]);
  const selectedCount = selected.length;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = selected.findIndex((m) => m.id === active.id);
    const newIdx = selected.findIndex((m) => m.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const next = arrayMove(selected, oldIdx, newIdx).map((m) => m.id);
    reorder.mutate({ productId, orderedIds: next });
  };

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
              <div className="space-y-5">
                {selected.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Sur la fiche · glissez pour réordonner
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Le 1ᵉʳ visuel = image principale
                      </p>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={selected.map((m) => m.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {selected.map((m, idx) => (
                            <SortableMediaCard
                              key={m.id}
                              media={m}
                              index={idx}
                              isPrimary={idx === 0}
                              onToggle={() =>
                                toggle.mutate({
                                  mediaId: m.id,
                                  productId,
                                  isSelected: false,
                                })
                              }
                              onSetPrimary={() =>
                                setPrimary.mutate({
                                  mediaId: m.id,
                                  productId,
                                  currentSelectedIds: selected.map((s) => s.id),
                                })
                              }
                              onDelete={() => {
                                if (!confirm("Supprimer ce visuel ?")) return;
                                remove.mutate({ mediaId: m.id, productId });
                              }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                {unselected.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                      Bibliothèque ({unselected.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {unselected.map((m) => (
                        <div
                          key={m.id}
                          className="relative group rounded-lg overflow-hidden border-2 border-border hover:border-bib-gold/50 transition"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggle.mutate({
                                mediaId: m.id,
                                productId,
                                isSelected: true,
                              })
                            }
                            className="block w-full aspect-[4/5] bg-muted"
                            title="Ajouter à la fiche"
                          >
                            <img
                              src={m.url}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </button>
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SortableCardProps {
  media: ProductMedia;
  index: number;
  isPrimary: boolean;
  onToggle: () => void;
  onSetPrimary: () => void;
  onDelete: () => void;
}

function SortableMediaCard({
  media,
  index,
  isPrimary,
  onToggle,
  onSetPrimary,
  onDelete,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: media.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-lg overflow-hidden border-2 transition ${
        isPrimary
          ? "border-bib-gold ring-2 ring-bib-gold/40"
          : "border-bib-gold/60"
      }`}
    >
      <div className="aspect-[4/5] bg-muted">
        <img src={media.url} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Order index */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
        <span className="bg-background/90 backdrop-blur text-[10px] font-semibold text-foreground rounded-full px-1.5 py-0.5 shadow">
          #{index + 1}
        </span>
        {isPrimary && (
          <span className="bg-bib-gold text-bib-marine rounded-full p-1 shadow" title="Image principale">
            <Star className="w-3 h-3 fill-current" />
          </span>
        )}
      </div>

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute bottom-1.5 left-1.5 bg-background/90 backdrop-blur rounded-full p-1 cursor-grab active:cursor-grabbing shadow"
        title="Glisser pour réordonner"
        aria-label="Glisser pour réordonner"
      >
        <GripVertical className="w-3 h-3" />
      </button>

      {/* Actions */}
      <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
        {!isPrimary && (
          <button
            type="button"
            onClick={onSetPrimary}
            className="bg-background/90 backdrop-blur rounded-full p-1 hover:text-bib-gold shadow"
            title="Définir comme principale"
            aria-label="Définir comme principale"
          >
            <Star className="w-3 h-3" />
          </button>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="bg-background/90 backdrop-blur rounded-full p-1 hover:text-foreground shadow"
          title="Retirer de la fiche"
          aria-label="Retirer de la fiche"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="bg-background/90 backdrop-blur rounded-full p-1 hover:text-destructive shadow"
          title="Supprimer"
          aria-label="Supprimer ce visuel"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}