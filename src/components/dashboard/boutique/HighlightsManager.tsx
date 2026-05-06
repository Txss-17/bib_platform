import { useRef, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Sparkles,
  Upload,
  Loader2,
  Trash2,
  ImageIcon,
  Video,
  ExternalLink,
  Wand2,
  GripVertical,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";

export interface Highlight {
  id: string;
  kind: "image" | "video";
  url: string;
  label?: string;
  cta_url?: string;
  enabled?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

const MAX_HIGHLIGHTS = 8;
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function currentSeason(): string {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "printemps";
  if (m >= 6 && m <= 8) return "été";
  if (m >= 9 && m <= 11) return "automne";
  return "hiver";
}

function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function SortableHighlight({
  h,
  idx,
  onPatch,
  onRemove,
}: {
  h: Highlight;
  idx: number;
  onPatch: (id: string, patch: Partial<Highlight>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: h.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };
  const enabled = h.enabled !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted/30"
    >
      <div className="relative aspect-[3/4] bg-muted">
        {h.kind === "video" ? (
          <video src={h.url} muted loop playsInline autoPlay className="h-full w-full object-cover" />
        ) : (
          <img src={h.url} alt={h.label ?? "Mise en avant"} className="h-full w-full object-cover" />
        )}
        <Badge className="absolute left-1.5 top-1.5 gap-1 bg-black/60 text-white border-0 text-[10px]">
          {h.kind === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
          {idx + 1}
        </Badge>
        <button
          {...attributes}
          {...listeners}
          className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded bg-black/60 text-white cursor-grab active:cursor-grabbing touch-none"
          aria-label="Réordonner"
          type="button"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        {!enabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[11px] font-medium text-white">
            Désactivée
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[11px] text-muted-foreground">Active</Label>
          <Switch
            checked={enabled}
            onCheckedChange={(v) => onPatch(h.id, { enabled: v })}
          />
        </div>
        <Input
          value={h.label ?? ""}
          onChange={(e) => onPatch(h.id, { label: e.target.value })}
          placeholder="Titre (ex: -20% été)"
          className="h-7 text-xs"
        />
        <Input
          value={h.cta_url ?? ""}
          onChange={(e) => onPatch(h.id, { cta_url: e.target.value })}
          placeholder="Lien CTA (optionnel)"
          className="h-7 text-xs"
        />
        <div className="grid grid-cols-2 gap-1">
          <div className="space-y-0.5">
            <Label className="text-[10px] text-muted-foreground">Début</Label>
            <Input
              type="datetime-local"
              value={toLocalInput(h.starts_at)}
              onChange={(e) => onPatch(h.id, { starts_at: fromLocalInput(e.target.value) })}
              className="h-7 text-[11px] px-1"
            />
          </div>
          <div className="space-y-0.5">
            <Label className="text-[10px] text-muted-foreground">Fin</Label>
            <Input
              type="datetime-local"
              value={toLocalInput(h.ends_at)}
              onChange={(e) => onPatch(h.id, { ends_at: fromLocalInput(e.target.value) })}
              className="h-7 text-[11px] px-1"
            />
          </div>
        </div>
        <div className="flex items-center justify-end pt-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(h.id)}
            aria-label="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HighlightsManager({ boutiqueId }: { boutiqueId: string }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftCta, setDraftCta] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiCount, setAiCount] = useState(1);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: boutique, isLoading } = useQuery({
    queryKey: ["boutique-highlights", boutiqueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .select("id, name, category, description, tagline, target_markets, highlight_media")
        .eq("id", boutiqueId)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  const highlights: Highlight[] = useMemo(
    () => (Array.isArray(boutique?.highlight_media) ? boutique.highlight_media : []),
    [boutique]
  );

  const saveMutation = useMutation({
    mutationFn: async (next: Highlight[]) => {
      const { error } = await supabase
        .from("boutiques")
        .update({ highlight_media: next as any })
        .eq("id", boutiqueId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boutique-highlights", boutiqueId] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-boutiques"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erreur lors de l'enregistrement"),
  });

  const addHighlight = (h: Highlight) => {
    if (highlights.length >= MAX_HIGHLIGHTS) {
      toast.error(`Limite de ${MAX_HIGHLIGHTS} mises en avant atteinte.`);
      return;
    }
    saveMutation.mutate([...highlights, { enabled: true, ...h }]);
  };

  const updateHighlight = (id: string, patch: Partial<Highlight>) => {
    saveMutation.mutate(highlights.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const removeHighlight = (id: string) => {
    const target = highlights.find((h) => h.id === id);
    saveMutation.mutate(highlights.filter((h) => h.id !== id));
    if (target) {
      const marker = "/boutique-media/";
      const i = target.url.indexOf(marker);
      if (i !== -1) {
        const path = decodeURIComponent(target.url.slice(i + marker.length).split("?")[0]);
        supabase.storage.from("boutique-media").remove([path]).catch(() => {});
      }
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = highlights.findIndex((h) => h.id === active.id);
    const newIdx = highlights.findIndex((h) => h.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    saveMutation.mutate(arrayMove(highlights, oldIdx, newIdx));
  };

  const handleFile = async (file: File) => {
    if (!user) return toast.error("Session expirée");
    const isImage = ALLOWED_IMAGE.includes(file.type);
    const isVideo = ALLOWED_VIDEO.includes(file.type);
    if (!isImage && !isVideo) {
      toast.error("Format non supporté.");
      return;
    }
    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (file.size > maxBytes) {
      toast.error(`Fichier trop volumineux (max ${(maxBytes / 1024 / 1024).toFixed(0)} Mo).`);
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || (isImage ? "jpg" : "mp4");
      const path = `highlights/${user.id}/${boutiqueId}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("boutique-media")
        .upload(path, file, { upsert: false, cacheControl: "3600", contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("boutique-media").getPublicUrl(path);
      addHighlight({
        id: uid(),
        kind: isImage ? "image" : "video",
        url: pub.publicUrl,
        label: draftLabel.trim() || undefined,
        cta_url: draftCta.trim() || undefined,
        enabled: true,
      });
      setDraftLabel("");
      setDraftCta("");
      toast.success("Mise en avant ajoutée");
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de l'upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!user) return toast.error("Session expirée");
    const userPrompt = aiPrompt.trim();
    if (userPrompt.length < 4) {
      toast.error("Décris ton actualité (ex: soldes été, nouvelle collection capsule)");
      return;
    }
    if (highlights.length >= MAX_HIGHLIGHTS) {
      toast.error(`Limite de ${MAX_HIGHLIGHTS} mises en avant atteinte.`);
      return;
    }
    const ctxParts = [
      boutique?.name && `Boutique: ${boutique.name}`,
      boutique?.category && `Catégorie: ${boutique.category}`,
      Array.isArray(boutique?.target_markets) && boutique.target_markets.length
        ? `Marché: ${boutique.target_markets.join(", ")}`
        : null,
      boutique?.tagline && `Positionnement: ${boutique.tagline}`,
      `Saison: ${currentSeason()} ${new Date().getFullYear()}`,
      `Actualité: ${userPrompt}`,
    ].filter(Boolean);
    const enrichedPrompt = ctxParts.join(" · ");

    const remaining = MAX_HIGHLIGHTS - highlights.length;
    const wanted = Math.min(Math.max(aiCount, 1), remaining);

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("studio-image-gen", {
        body: { boutique_id: boutiqueId, prompt: enrichedPrompt, count: wanted },
      });
      if (error) throw error;
      const urls = ((data as { urls?: string[]; url?: string })?.urls) ??
        ((data as { url?: string })?.url ? [(data as { url: string }).url] : []);
      if (urls.length === 0) throw new Error("Génération échouée");
      const baseLabel = draftLabel.trim() || userPrompt.slice(0, 40);
      const next = [...highlights];
      urls.forEach((url, i) => {
        if (next.length >= MAX_HIGHLIGHTS) return;
        next.push({
          id: uid(),
          kind: "image",
          url,
          label: urls.length > 1 ? `${baseLabel} (${i + 1})` : baseLabel,
          cta_url: draftCta.trim() || undefined,
          enabled: true,
        });
      });
      saveMutation.mutate(next);
      setAiPrompt("");
      setDraftLabel("");
      setDraftCta("");
      toast.success(
        `${urls.length} visuel${urls.length > 1 ? "s" : ""} IA généré${urls.length > 1 ? "s" : ""} (identité boutique respectée)`
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur de génération");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-primary" />
          Mises en avant marketplace
        </CardTitle>
        <CardDescription>
          1 à {MAX_HIGHLIGHTS} visuels/vidéos affichés en story sur votre carte boutique. Activez,
          planifiez (date début/fin) et glissez-déposez pour réordonner — l'ordre est respecté sur la marketplace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {highlights.length > 0 && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={highlights.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {highlights.map((h, idx) => (
                      <SortableHighlight
                        key={h.id}
                        h={h}
                        idx={idx}
                        onPatch={updateHighlight}
                        onRemove={removeHighlight}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {highlights.length < MAX_HIGHLIGHTS && (
              <div className="space-y-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="hl-label" className="text-xs">Titre (optionnel)</Label>
                    <Input
                      id="hl-label"
                      value={draftLabel}
                      onChange={(e) => setDraftLabel(e.target.value)}
                      placeholder="Ex: Nouvelle collection automne"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hl-cta" className="text-xs">Lien CTA (optionnel)</Label>
                    <Input
                      id="hl-cta"
                      value={draftCta}
                      onChange={(e) => setDraftCta(e.target.value)}
                      placeholder="https://… ou /produit/…"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept={[...ALLOWED_IMAGE, ...ALLOWED_VIDEO].join(",")}
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading || generating || saveMutation.isPending}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Uploader image / vidéo
                  </Button>
                  <div className="flex gap-2">
                    <Input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Actualité (promo, nouveauté…)"
                      className="h-9 text-sm"
                      disabled={generating}
                    />
                    <Input
                      type="number"
                      min={1}
                      max={Math.max(1, MAX_HIGHLIGHTS - highlights.length)}
                      value={aiCount}
                      onChange={(e) => setAiCount(Math.max(1, Math.min(MAX_HIGHLIGHTS - highlights.length, Number(e.target.value) || 1)))}
                      className="h-9 w-14 text-sm"
                      disabled={generating}
                      title="Nombre de visuels à générer (1-8)"
                    />
                    <Button
                      type="button"
                      onClick={handleGenerate}
                      disabled={generating || uploading || saveMutation.isPending}
                      title={`Générer ${aiCount} visuel(s) IA cohérent(s) avec votre boutique`}
                    >
                      {generating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <CalendarClock className="h-3 w-3 mt-0.5 shrink-0" />
                  L'IA s'appuie sur votre identité (palette, ambiance, mots-clés), votre catégorie ({boutique?.category ?? "—"}), votre marché et la saison ({currentSeason()}). Génération en lot 1–8. Image ≤ 6 Mo · Vidéo ≤ 30 Mo.
                </p>
              </div>
            )}

            {highlights.length > 0 && (
              <a
                href="/store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Voir le rendu sur la marketplace
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
