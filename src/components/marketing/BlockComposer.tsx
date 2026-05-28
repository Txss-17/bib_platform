import { useState, useMemo, useEffect } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Heading1, Type, Image as ImageIcon, MousePointerClick, Tag, Package,
  Minus as MinusIcon, Space, Trash2, GripVertical, ChevronUp, ChevronDown, Eye, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";
import {
  BLOCK_LIBRARY, newBlock, renderBlocksToHtml, type MarketingBlock,
} from "@/lib/marketingBlocks";

const ICONS: Record<string, any> = {
  Heading1, Text: Type, Image: ImageIcon, MousePointerClick, Tag, Package, Minus: MinusIcon, Space,
};

interface Props {
  boutiqueId: string;
  blocks: MarketingBlock[];
  onChange: (b: MarketingBlock[]) => void;
  signature?: string | null;
  footerLinks?: Record<string, string> | null;
  boutiqueName?: string;
  boutiqueSlug?: string;
  promoCode?: string;
}

export function BlockComposer({
  boutiqueId, blocks, onChange, signature, footerLinks, boutiqueName, boutiqueSlug, promoCode,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id ?? null);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    if (!selectedId && blocks.length) setSelectedId(blocks[0].id);
  }, [blocks, selectedId]);

  const selected = blocks.find((b) => b.id === selectedId) ?? null;

  const addBlock = (type: MarketingBlock["type"]) => {
    const b = newBlock(type);
    onChange([...blocks, b]);
    setSelectedId(b.id);
  };
  const updateBlock = (id: string, patch: Partial<MarketingBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } as MarketingBlock : b)));
  const removeBlock = (id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    onChange(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };
  const moveBlock = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    onChange(arrayMove(blocks, i, j));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    onChange(arrayMove(blocks, oldIdx, newIdx));
  };

  const previewHtml = useMemo(
    () => renderBlocksToHtml(blocks, { signature, footerLinks, boutiqueName }).replace(/\{\{promo_code\}\}/g, promoCode || "VOTRECODE"),
    [blocks, signature, footerLinks, boutiqueName, promoCode],
  );

  return (
    <div className="space-y-3">
      {/* Toolbar: add buttons + view toggle */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
        <span className="text-xs text-muted-foreground mr-1">Ajouter :</span>
        {BLOCK_LIBRARY.map((b) => {
          const Icon = ICONS[b.icon] ?? Type;
          return (
            <Button
              key={b.type}
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => addBlock(b.type)}
            >
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              {b.label}
            </Button>
          );
        })}
        <div className="ml-auto flex gap-1">
          <Button
            type="button" size="sm"
            variant={view === "edit" ? "default" : "outline"}
            onClick={() => setView("edit")}
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Éditer
          </Button>
          <Button
            type="button" size="sm"
            variant={view === "preview" ? "default" : "outline"}
            onClick={() => setView("preview")}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" /> Aperçu
          </Button>
        </div>
      </div>

      {view === "preview" ? (
        <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
          <iframe
            title="Aperçu email"
            srcDoc={previewHtml}
            className="w-full h-[600px] bg-white"
            sandbox=""
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_320px] gap-3">
          {/* Block list */}
          <Card>
            <CardContent className="p-3 min-h-[400px]">
              {blocks.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  Cliquez un bouton ci-dessus pour ajouter votre premier bloc.
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                      {blocks.map((b, i) => (
                        <SortableRow
                          key={b.id}
                          block={b}
                          isSelected={b.id === selectedId}
                          onSelect={() => setSelectedId(b.id)}
                          onDelete={() => removeBlock(b.id)}
                          onUp={i > 0 ? () => moveBlock(b.id, -1) : undefined}
                          onDown={i < blocks.length - 1 ? () => moveBlock(b.id, 1) : undefined}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>

          {/* Inspector */}
          <Card>
            <CardContent className="p-3 space-y-3">
              {selected ? (
                <BlockEditor
                  block={selected}
                  onChange={(patch) => updateBlock(selected.id, patch)}
                  boutiqueId={boutiqueId}
                />
              ) : (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  Sélectionnez un bloc pour le modifier.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available variables hint */}
      <div className="text-[11px] text-muted-foreground px-1">
        Variables (insérables dans les textes) :{" "}
        {["{{first_name}}", "{{full_name}}", "{{boutique_name}}", "{{promo_code}}"].map((v) => (
          <code key={v} className="px-1.5 py-0.5 mx-0.5 bg-muted rounded">{v}</code>
        ))}
      </div>
    </div>
  );
}

function SortableRow({
  block, isSelected, onSelect, onDelete, onUp, onDown,
}: {
  block: MarketingBlock; isSelected: boolean; onSelect: () => void; onDelete: () => void;
  onUp?: () => void; onDown?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-md border ${
        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
      }`}
      onClick={onSelect}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground"
        {...attributes} {...listeners}
        aria-label="Réordonner"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{labelFor(block.type)}</div>
        <div className="text-sm text-foreground truncate">{summaryFor(block)}</div>
      </div>
      <div className="flex items-center gap-0.5">
        {onUp && <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onUp(); }}><ChevronUp className="w-3.5 h-3.5" /></Button>}
        {onDown && <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onDown(); }}><ChevronDown className="w-3.5 h-3.5" /></Button>}
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </li>
  );
}

function labelFor(t: MarketingBlock["type"]): string {
  const m: Record<string, string> = {
    heading: "Titre", text: "Paragraphe", image: "Image", button: "Bouton",
    promo_code: "Code promo", product_grid: "Produits", divider: "Séparateur", spacer: "Espace",
  };
  return m[t] ?? t;
}
function summaryFor(b: MarketingBlock): string {
  switch (b.type) {
    case "heading": case "text": return b.text || "(vide)";
    case "image": return b.url ? "Image définie" : "(à configurer)";
    case "button": return `${b.label || "(libellé)"} → ${b.href || "(URL)"}`;
    case "promo_code": return "Encart code promo personnalisé";
    case "product_grid": return `${b.product_ids?.length ?? 0} produit(s)`;
    case "divider": return "Ligne de séparation";
    case "spacer": return `Espace ${b.size}`;
  }
}

function BlockEditor({
  block, onChange, boutiqueId,
}: {
  block: MarketingBlock; onChange: (patch: Partial<MarketingBlock>) => void; boutiqueId: string;
}) {
  if (block.type === "heading") {
    return (
      <div className="space-y-2">
        <div>
          <Label className="text-xs">Texte du titre</Label>
          <Input value={block.text} onChange={(e) => onChange({ text: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Niveau</Label>
          <Select value={String(block.level)} onValueChange={(v) => onChange({ level: Number(v) as 1 | 2 })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1 — Très grand</SelectItem>
              <SelectItem value="2">H2 — Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  if (block.type === "text") {
    return (
      <div>
        <Label className="text-xs">Texte</Label>
        <Textarea rows={8} value={block.text} onChange={(e) => onChange({ text: e.target.value })} />
        <p className="text-[10px] text-muted-foreground mt-1">Astuce : Entrée crée un saut de ligne.</p>
      </div>
    );
  }
  if (block.type === "image") {
    return (
      <div className="space-y-2">
        <div>
          <Label className="text-xs">URL de l'image</Label>
          <Input placeholder="https://…" value={block.url} onChange={(e) => onChange({ url: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Texte alternatif</Label>
          <Input value={block.alt ?? ""} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Description courte" />
        </div>
        <div>
          <Label className="text-xs">Lien au clic (optionnel)</Label>
          <Input value={block.href ?? ""} onChange={(e) => onChange({ href: e.target.value })} placeholder="https://…" />
        </div>
      </div>
    );
  }
  if (block.type === "button") {
    return (
      <div className="space-y-2">
        <div>
          <Label className="text-xs">Libellé</Label>
          <Input value={block.label} onChange={(e) => onChange({ label: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Lien (URL)</Label>
          <Input value={block.href} onChange={(e) => onChange({ href: e.target.value })} placeholder="https://…" />
        </div>
      </div>
    );
  }
  if (block.type === "promo_code") {
    return (
      <div>
        <Label className="text-xs">Étiquette (au-dessus du code)</Label>
        <Input value={block.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} />
        <p className="text-[10px] text-muted-foreground mt-1">
          Le code <code>{`{{promo_code}}`}</code> est inséré automatiquement à l'envoi.
        </p>
      </div>
    );
  }
  if (block.type === "product_grid") {
    return <ProductGridEditor block={block} onChange={onChange} boutiqueId={boutiqueId} />;
  }
  if (block.type === "spacer") {
    return (
      <div>
        <Label className="text-xs">Taille</Label>
        <Select value={block.size} onValueChange={(v) => onChange({ size: v as any })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Petit</SelectItem>
            <SelectItem value="md">Moyen</SelectItem>
            <SelectItem value="lg">Grand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (block.type === "divider") {
    return <p className="text-xs text-muted-foreground">Aucun réglage. Ligne fine entre deux sections.</p>;
  }
  return null;
}

function ProductGridEditor({
  block, onChange,
}: {
  block: Extract<MarketingBlock, { type: "product_grid" }>;
  onChange: (patch: Partial<MarketingBlock>) => void;
  boutiqueId: string;
}) {
  const { data: products = [] } = useProducts();
  const selected = new Set(block.product_ids);
  const toggle = (id: string) => {
    const next = selected.has(id)
      ? block.product_ids.filter((x) => x !== id)
      : [...block.product_ids, id].slice(0, 4);
    onChange({ product_ids: next });
  };
  return (
    <div className="space-y-2">
      <Label className="text-xs">Produits (max 4)</Label>
      <div className="max-h-72 overflow-auto space-y-1 border border-border rounded-md p-2">
        {products.length === 0 && (
          <p className="text-xs text-muted-foreground py-2 text-center">Aucun produit dans cette boutique.</p>
        )}
        {products.map((p: any) => (
          <label
            key={p.id}
            className={`flex items-center gap-2 p-1.5 rounded text-sm cursor-pointer ${
              selected.has(p.id) ? "bg-primary/10" : "hover:bg-muted/50"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(p.id)}
              onChange={() => toggle(p.id)}
              disabled={!selected.has(p.id) && selected.size >= 4}
            />
            <span className="flex-1 truncate">{p.supplier_products?.name ?? "Produit"}</span>
            <Badge variant="outline" className="text-[10px]">{Number(p.public_price ?? 0).toFixed(2)}€</Badge>
          </label>
        ))}
      </div>
    </div>
  );
}