import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Upload,
  Loader2,
  Trash2,
  ImageIcon,
  Video,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Marketing "highlights" displayed in a horizontal carousel on the marketplace
 * boutique card. Each highlight is a short story-style image or video the
 * boutique owner can use to promote a sale, a new collection, an event, etc.
 */
export interface Highlight {
  id: string;
  kind: "image" | "video";
  url: string;
  label?: string;
  cta_url?: string;
}

const MAX_HIGHLIGHTS = 8;
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 MB
const MAX_VIDEO_BYTES = 30 * 1024 * 1024; // 30 MB

function uid() {
  return (
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  );
}

export function HighlightsManager({ boutiqueId }: { boutiqueId: string }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftCta, setDraftCta] = useState("");

  const { data: boutique, isLoading } = useQuery({
    queryKey: ["boutique-highlights", boutiqueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .select("id, highlight_media")
        .eq("id", boutiqueId)
        .single();
      if (error) throw error;
      return data as unknown as { id: string; highlight_media: Highlight[] | null };
    },
  });

  const highlights: Highlight[] = (boutique?.highlight_media as Highlight[] | null) ?? [];

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
    saveMutation.mutate([...highlights, h]);
  };

  const updateHighlight = (id: string, patch: Partial<Highlight>) => {
    saveMutation.mutate(highlights.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const removeHighlight = (id: string) => {
    const target = highlights.find((h) => h.id === id);
    saveMutation.mutate(highlights.filter((h) => h.id !== id));
    // Best-effort storage cleanup for files we uploaded ourselves.
    if (target) {
      const marker = "/boutique-media/";
      const i = target.url.indexOf(marker);
      if (i !== -1) {
        const path = decodeURIComponent(target.url.slice(i + marker.length).split("?")[0]);
        supabase.storage.from("boutique-media").remove([path]).catch(() => {});
      }
    }
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = highlights.findIndex((h) => h.id === id);
    if (idx === -1) return;
    const target = idx + dir;
    if (target < 0 || target >= highlights.length) return;
    const next = [...highlights];
    [next[idx], next[target]] = [next[target], next[idx]];
    saveMutation.mutate(next);
  };

  const handleFile = async (file: File) => {
    if (!user) return toast.error("Session expirée");
    const isImage = ALLOWED_IMAGE.includes(file.type);
    const isVideo = ALLOWED_VIDEO.includes(file.type);
    if (!isImage && !isVideo) {
      toast.error("Format non supporté. JPG/PNG/WebP/GIF ou MP4/WebM.");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-primary" />
          Mises en avant marketplace
        </CardTitle>
        <CardDescription>
          Alimentez votre carte boutique sur la marketplace avec des visuels et vidéos
          (promo, nouvelle collection, événement). Affichées en défilement automatique
          comme des stories. Jusqu'à {MAX_HIGHLIGHTS} éléments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {highlights.map((h, idx) => (
                <div
                  key={h.id}
                  className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted/30"
                >
                  <div className="relative aspect-[3/4] bg-muted">
                    {h.kind === "video" ? (
                      <video
                        src={h.url}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img src={h.url} alt={h.label ?? "Mise en avant"} className="h-full w-full object-cover" />
                    )}
                    <Badge className="absolute left-1.5 top-1.5 gap-1 bg-black/60 text-white border-0 text-[10px]">
                      {h.kind === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      {idx + 1}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 p-2">
                    <Input
                      value={h.label ?? ""}
                      onChange={(e) => updateHighlight(h.id, { label: e.target.value })}
                      placeholder="Titre (ex: -20% été)"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={h.cta_url ?? ""}
                      onChange={(e) => updateHighlight(h.id, { cta_url: e.target.value })}
                      placeholder="Lien (optionnel)"
                      className="h-7 text-xs"
                    />
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => move(h.id, -1)}
                          disabled={idx === 0}
                          aria-label="Monter"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => move(h.id, 1)}
                          disabled={idx === highlights.length - 1}
                          aria-label="Descendre"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeHighlight(h.id)}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || saveMutation.isPending}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Ajouter image ou vidéo
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Recommandé : portrait 3:4 (1080×1440). Image ≤ 6 Mo · Vidéo ≤ 30 Mo, 5–10 s.
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