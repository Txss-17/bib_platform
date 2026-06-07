import { useRef, useState } from "react";
import { Loader2, Upload, Sparkles, Trash2, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUploadSceneAsset, useGenerateSceneImage } from "@/hooks/useBrandStudio";
import type { SectionConfig } from "@/lib/boutiqueTemplates";

type Media = { url: string; alt?: string; poster?: string };

export function GallerySectionEditor({
  boutiqueId,
  section,
  onChange,
}: {
  boutiqueId: string;
  section: SectionConfig;
  onChange: (data: Record<string, any>) => void;
}) {
  const isVideo = section.type === "video-gallery";
  const key = isVideo ? "videos" : "images";
  const items: Media[] = (section.data?.[key] as Media[]) || [];
  const columns = (section.data?.columns as 1 | 2 | 3 | 4) || (isVideo ? 2 : 3);
  const effect = (section.data?.effect as string) || "slide-up";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const upload = useUploadSceneAsset();
  const genImage = useGenerateSceneImage();

  const setItems = (next: Media[]) => onChange({ ...section.data, [key]: next.slice(0, 5) });
  const setData = (patch: Record<string, any>) => onChange({ ...section.data, ...patch });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = Math.max(0, 5 - items.length);
    if (remaining === 0) {
      toast.error("Maximum 5 éléments");
      return;
    }
    const list = Array.from(files).slice(0, remaining);
    const next: Media[] = [...items];
    for (const file of list) {
      try {
        if (isVideo && !file.type.startsWith("video/")) continue;
        if (!isVideo && !file.type.startsWith("image/")) continue;
        const url = await upload.mutateAsync({ boutiqueId, file });
        next.push({ url });
      } catch (e: any) {
        toast.error(e?.message || "Upload échoué");
      }
    }
    setItems(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Décrivez ce que vous voulez générer");
      return;
    }
    if (items.length >= 5) {
      toast.error("Maximum 5 éléments");
      return;
    }
    setGenerating(true);
    try {
      if (isVideo) {
        // Generate an image first, use it as a poster + reuse url (best-effort placeholder for video)
        toast.info("Génération vidéo IA bientôt disponible — image générée à la place.");
        const url = await genImage.mutateAsync({ boutiqueId, prompt, aspect: "9:16" });
        setItems([...items, { url, poster: url }]);
      } else {
        const url = await genImage.mutateAsync({ boutiqueId, prompt, aspect: "4:3" });
        setItems([...items, { url }]);
      }
      setPrompt("");
      toast.success("Média ajouté");
    } catch (e: any) {
      toast.error(e?.message || "Génération échouée");
    } finally {
      setGenerating(false);
    }
  };

  const removeAt = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <div className="px-3 pb-3 pt-2 border-t border-border/40 space-y-3">
      <div className="flex items-center gap-2">
        {isVideo ? <VideoIcon className="w-3.5 h-3.5 text-muted-foreground" /> : <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />}
        <Label className="text-xs text-muted-foreground">
          Médias ({items.length}/5)
        </Label>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {items.map((m, i) => (
            <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-muted border border-border">
              {isVideo ? (
                <video src={m.url} poster={m.poster} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img src={m.url} alt={m.alt || `Média ${i + 1}`} className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 h-6 w-6 inline-flex items-center justify-center rounded-full bg-background/90 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={isVideo ? "video/*" : "image/*"}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={upload.isPending || items.length >= 5}
        >
          {upload.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          Importer
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Générer avec l'IA
        </Label>
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isVideo ? "Décrivez la scène (courte vidéo)" : "Décrivez l'image"}
            className="h-8 text-xs"
          />
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={handleGenerate}
            disabled={generating || items.length >= 5}
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Générer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[11px] text-muted-foreground">Colonnes</Label>
          <div className="grid grid-cols-4 gap-1 mt-1">
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setData({ columns: c })}
                className={`text-[11px] py-1 rounded border transition-colors ${
                  columns === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Effet</Label>
          <select
            value={effect}
            onChange={(e) => setData({ effect: e.target.value })}
            className="mt-1 w-full text-xs rounded-md border border-border bg-background px-2 py-1.5"
          >
            <option value="none">Aucun</option>
            <option value="fade">Fondu</option>
            <option value="slide-up">Glisse haut</option>
            <option value="zoom">Zoom</option>
            <option value="tilt">Tilt</option>
          </select>
        </div>
      </div>
    </div>
  );
}