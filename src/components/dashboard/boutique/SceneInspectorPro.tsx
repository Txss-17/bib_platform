import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Trash2, Plus, Wand2, Image as ImageIcon, Upload, Loader2, Sparkles, Palette, RotateCcw, Layout as LayoutIcon, Sliders, Film } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { ALL_FONTS, loadGoogleFont } from "@/lib/googleFonts";
import { toast } from "sonner";
import { findSceneDefinition, type SceneRecord } from "@/lib/studioScenes";
import {
  useGenerateSceneImage,
  useUploadSceneAsset,
} from "@/hooks/useBrandStudio";
import { ActionButton, stateFromMutation } from "./ActionButton";
import { resizeImageFile } from "@/lib/imageResize";

type Patch = Partial<Pick<SceneRecord, "content" | "variant" | "is_visible" | "style_overrides">>;

/* ---------- HSL <-> hex helpers (local copy) ---------- */
function hslToHex(hsl?: string | null): string {
  if (!hsl) return "#000000";
  const m = hsl.trim().match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/);
  if (!m) return "#000000";
  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function hexToHsl(hex: string): string {
  const m = hex.trim().replace("#", "");
  if (m.length !== 6) return "0 0% 0%";
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      default: h = ((r - g) / d + 4);
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface Props {
  scene: SceneRecord;
  boutiqueId: string;
  onPatch: (p: Patch) => void;
  onDelete: () => void;
  onRemix: () => void;
  remixState?: "idle" | "loading" | "success" | "error";
  products?: Array<{ id: string; name: string; image_url?: string | null }>;
}

/** Champ image avec upload + génération IA. Exporté pour réutilisation (ex: hero de page). */
export function ImageField({
  boutiqueId,
  label,
  value,
  onChange,
  promptHint,
  aspect = "4:3",
}: {
  boutiqueId: string;
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  promptHint?: string;
  aspect?: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const upload = useUploadSceneAsset();
  const genImg = useGenerateSceneImage();
  const [prompt, setPrompt] = useState(promptHint ?? "");
  const [showAi, setShowAi] = useState(false);

  const handleFile = async (f: File | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image > 10 Mo, choisis un fichier plus léger.");
      return;
    }
    try {
      // Redimensionne côté client (max 1920px, JPEG/PNG/WebP) pour garder
      // le bucket léger et le storefront rapide.
      const optimized = await resizeImageFile(f).catch(() => f);
      const url = await upload.mutateAsync({ boutiqueId, file: optimized });
      onChange(url);
      toast.success("Image téléversée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload impossible");
    }
  };

  const handleGen = async () => {
    if (!prompt.trim()) return;
    try {
      const url = await genImg.mutateAsync({ boutiqueId, prompt, aspect });
      onChange(url);
      setShowAi(false);
      toast.success("Image IA générée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Génération impossible");
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2 items-start">
        <div
          className="w-20 h-20 rounded-md border border-border/60 bg-muted/40 bg-cover bg-center shrink-0"
          style={value ? { backgroundImage: `url(${value})` } : undefined}
        >
          {!value && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-5 h-5 opacity-40" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInput.current?.click()}
              disabled={upload.isPending}
              className="h-7 text-xs"
            >
              {upload.isPending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              Téléverser
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowAi((v) => !v)}
              className="h-7 text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" /> IA
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(null)}
                className="h-7 text-xs text-destructive"
              >
                Retirer
              </Button>
            )}
          </div>
          {showAi && (
            <div className="space-y-1.5 rounded-md border border-border/40 p-2 bg-muted/20">
              <Textarea
                rows={2}
                placeholder={promptHint ?? "Décris l'image à générer…"}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-xs"
              />
              <ActionButton
                size="sm"
                onClick={handleGen}
                state={stateFromMutation(genImg)}
                loadingLabel="Génération…"
                successLabel="Générée"
                errorLabel="Échec"
                disabled={prompt.trim().length < 4}
                className="w-full h-7 text-xs"
              >
                <Wand2 className="w-3 h-3 mr-1 inline" /> Générer avec l'IA
              </ActionButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------- Liste éditable générique -------- */
function ListEditor<T extends Record<string, any>>({
  items,
  onChange,
  factory,
  renderItem,
  addLabel,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  factory: () => T;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-md border border-border/40 p-2 space-y-1.5 relative">
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="absolute top-1.5 right-1.5 p-1 rounded hover:bg-destructive/10 text-destructive"
            aria-label="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {renderItem(it, (patch) =>
            onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x))),
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full h-8 text-xs"
        onClick={() => onChange([...items, factory()])}
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> {addLabel}
      </Button>
    </div>
  );
}

export function SceneInspectorPro({
  scene,
  boutiqueId,
  onPatch,
  onDelete,
  onRemix,
  remixState,
  products = [],
}: Props) {
  const def = findSceneDefinition(scene.scene_type);
  const c = scene.content as Record<string, any>;
  const setField = (key: string, value: unknown) =>
    onPatch({ content: { ...c, [key]: value } });

  const ov = scene.style_overrides ?? null;
  const hasOverrides = !!ov && (
    !!ov.palette?.primary || !!ov.palette?.accent || !!ov.palette?.surface || !!ov.palette?.ink ||
    !!ov.fonts?.display || !!ov.fonts?.body
  );
  const setOv = (next: SceneRecord["style_overrides"]) =>
    onPatch({ style_overrides: next });
  const setOvPalette = (k: "primary" | "accent" | "surface" | "ink", hsl: string) =>
    setOv({
      ...(ov ?? {}),
      palette: { ...(ov?.palette ?? {}), [k]: hsl },
    });
  const setOvFont = (k: "display" | "body", value: string) => {
    if (value) loadGoogleFont(value);
    setOv({
      ...(ov ?? {}),
      fonts: { ...(ov?.fonts ?? {}), [k]: value || undefined },
    });
  };

  const generic = (
    <>
      {"title" in c && (
        <div>
          <Label className="text-xs">Titre</Label>
          <Input value={c.title ?? ""} onChange={(e) => setField("title", e.target.value)} />
        </div>
      )}
      {"subtitle" in c && (
        <div>
          <Label className="text-xs">Sous-titre</Label>
          <Textarea
            rows={2}
            value={c.subtitle ?? ""}
            onChange={(e) => setField("subtitle", e.target.value)}
          />
        </div>
      )}
      {"ctaLabel" in c && (
        <div>
          <Label className="text-xs">CTA principal</Label>
          <Input
            value={c.ctaLabel ?? ""}
            onChange={(e) => setField("ctaLabel", e.target.value)}
          />
        </div>
      )}
      {"ctaSecondaryLabel" in c && (
        <div>
          <Label className="text-xs">CTA secondaire</Label>
          <Input
            value={c.ctaSecondaryLabel ?? ""}
            onChange={(e) => setField("ctaSecondaryLabel", e.target.value)}
          />
        </div>
      )}
    </>
  );

  return (
    <Card className="p-3 mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-60">Inspecteur</p>
          <p className="text-sm font-semibold">{def?.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <ActionButton
            variant="ghost"
            size="icon"
            onClick={onRemix}
            state={remixState ?? "idle"}
            loadingLabel=""
            successLabel=""
            errorLabel=""
            title="Remix IA — réécrit le contenu textuel"
          >
            <Wand2 className="w-4 h-4" />
          </ActionButton>
          <Switch
            checked={scene.is_visible}
            onCheckedChange={(v) => onPatch({ is_visible: v })}
          />
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {def && def.variants.length > 1 && (
        <div>
          <Label className="text-xs">Variante</Label>
          <Select value={scene.variant} onValueChange={(v) => onPatch({ variant: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {def.variants.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* STYLE — hériter / personnaliser */}
      <details className="rounded-md border border-border/40 bg-muted/20 px-2 py-1.5" open={hasOverrides}>
        <summary className="cursor-pointer text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Palette className="w-3.5 h-3.5" />
            Style — {hasOverrides ? "Personnalisé" : "Hérite de l'identité"}
          </span>
          {hasOverrides && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setOv(null); }}
              className="text-[10px] text-primary hover:underline flex items-center gap-1"
              title="Réinitialiser → hériter"
            >
              <RotateCcw className="w-3 h-3" /> Réinit.
            </button>
          )}
        </summary>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[11px]">Hériter de l'identité</Label>
            <Switch
              checked={!hasOverrides}
              onCheckedChange={(checked) => {
                if (checked) setOv(null);
                else setOv({ palette: {}, fonts: {} });
              }}
            />
          </div>
          {hasOverrides && (
            <>
              <div>
                <Label className="text-[10px] uppercase opacity-60">Palette (override)</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {(["primary", "accent", "surface", "ink"] as const).map((k) => {
                    const v = ov?.palette?.[k];
                    const hex = hslToHex(v);
                    return (
                      <label key={k} className="flex flex-col items-center gap-1 cursor-pointer">
                        <span
                          className="relative h-7 w-full rounded border border-border overflow-hidden"
                          style={{ background: v ? `hsl(${v})` : "repeating-linear-gradient(45deg, transparent 0 4px, hsl(var(--muted)) 4px 8px)" }}
                        >
                          <input
                            type="color"
                            value={hex}
                            onChange={(e) => setOvPalette(k, hexToHsl(e.target.value))}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            aria-label={`Override ${k}`}
                          />
                        </span>
                        <span className="text-[10px] opacity-60 capitalize">{k}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] opacity-50 mt-1">Vide = hérite de l'identité.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] uppercase opacity-60">Police titres</Label>
                  <Select
                    value={ov?.fonts?.display || "__inherit"}
                    onValueChange={(v) => setOvFont("display", v === "__inherit" ? "" : v)}
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="__inherit">— Hériter —</SelectItem>
                      {ALL_FONTS.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] uppercase opacity-60">Police corps</Label>
                  <Select
                    value={ov?.fonts?.body || "__inherit"}
                    onValueChange={(v) => setOvFont("body", v === "__inherit" ? "" : v)}
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="__inherit">— Hériter —</SelectItem>
                      {ALL_FONTS.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>
      </details>

      {/* MODE PRO — layout, fond, boutons, animation */}
      <ProModePanel
        scene={scene}
        boutiqueId={boutiqueId}
        onPatch={onPatch}
      />

      {/* HERO CINEMA */}
      {scene.scene_type === "hero-cinema" && (
        <>
          {generic}
          <ImageField
            boutiqueId={boutiqueId}
            label="Image de fond"
            value={c.backgroundImage}
            onChange={(url) => setField("backgroundImage", url)}
            aspect="16:9"
            promptHint="Visuel hero cinématographique pour la marque"
          />
          <div>
            <Label className="text-xs">URL vidéo de fond (optionnel)</Label>
            <Input
              placeholder="https://…/hero.mp4"
              value={c.videoUrl ?? ""}
              onChange={(e) => setField("videoUrl", e.target.value || null)}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/40 px-2 py-1.5">
            <div>
              <Label className="text-xs">Image de fond pleine page</Label>
              <p className="text-[10px] opacity-60">Étend l'image à toute la home (pas seulement le hero).</p>
            </div>
            <Switch
              checked={!!c.fullPageBackground}
              onCheckedChange={(v) => setField("fullPageBackground", v)}
            />
          </div>
          <div>
            <Label className="text-xs">Alignement du texte</Label>
            <Select
              value={c.textAlign ?? "center"}
              onValueChange={(v) => setField("textAlign", v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Gauche</SelectItem>
                <SelectItem value="center">Centré</SelectItem>
                <SelectItem value="right">Droite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* SHOWCASE MAGAZINE */}
      {scene.scene_type === "showcase-magazine" && (
        <>
          {generic}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Forme des cadres</Label>
              <Select
                value={c.cardShape ?? "rounded"}
                onValueChange={(v) => setField("cardShape", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Carré</SelectItem>
                  <SelectItem value="rounded">Arrondi</SelectItem>
                  <SelectItem value="rounded-xl">Très arrondi</SelectItem>
                  <SelectItem value="circle">Cercle</SelectItem>
                  <SelectItem value="arch">Arche</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Style cadre</Label>
              <Select
                value={c.cardStyle ?? "minimal"}
                onValueChange={(v) => setField("cardStyle", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="card">Carte (ombre)</SelectItem>
                  <SelectItem value="bordered">Avec bordure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* MARQUEE STRIP */}
      {scene.scene_type === "marquee-strip" && (
        <>
          <div>
            <Label className="text-xs">Texte défilant</Label>
            <Textarea
              rows={2}
              value={c.text ?? ""}
              onChange={(e) => setField("text", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Séparateur</Label>
              <Input value={c.separator ?? "·"} onChange={(e) => setField("separator", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Vitesse (s)</Label>
              <Input
                type="number"
                value={c.speed ?? 30}
                onChange={(e) => setField("speed", Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Police</Label>
            <Select
              value={c.fontFamily || "__inherit"}
              onValueChange={(v) => {
                const val = v === "__inherit" ? "" : v;
                setField("fontFamily", val);
                if (val) loadGoogleFont(val);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="__inherit">— Hériter de l'identité —</SelectItem>
                {ALL_FONTS.map((f) => (
                  <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Taille (px)</Label>
              <Input
                type="number"
                value={c.fontSize ?? 18}
                onChange={(e) => setField("fontSize", Number(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Direction</Label>
              <Select value={c.direction ?? "left"} onValueChange={(v) => setField("direction", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">← Gauche</SelectItem>
                  <SelectItem value="right">Droite →</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/40 px-2 py-1.5">
            <Label className="text-xs">MAJUSCULES</Label>
            <Switch
              checked={!!c.uppercase}
              onCheckedChange={(v) => setField("uppercase", v)}
            />
          </div>
        </>
      )}

      {/* GALLERY MOSAIC */}
      {scene.scene_type === "gallery-mosaic" && (
        <>
          {generic}
          <div>
            <Label className="text-xs mb-2 block">Visuels (jusqu'à 12)</Label>
            <ListEditor
              items={((c.images ?? []) as string[]).map((url) => ({ url }))}
              factory={() => ({ url: "" })}
              addLabel="Ajouter un visuel"
              onChange={(next) => setField("images", next.map((x) => x.url).filter(Boolean))}
              renderItem={(item, update) => (
                <ImageField
                  boutiqueId={boutiqueId}
                  label="Visuel"
                  value={item.url}
                  onChange={(url) => update({ url: url ?? "" })}
                  aspect="1:1"
                  promptHint="Visuel mosaïque éditorial"
                />
              )}
            />
          </div>
        </>
      )}

      {/* STATS */}
      {scene.scene_type === "stats-counter" && (
        <>
          {"title" in c && (
            <div>
              <Label className="text-xs">Titre</Label>
              <Input value={c.title ?? ""} onChange={(e) => setField("title", e.target.value)} />
            </div>
          )}
          <div>
            <Label className="text-xs mb-2 block">Statistiques</Label>
            <ListEditor
              items={(c.stats ?? []) as Array<Record<string, any>>}
              factory={() => ({ value: "", label: "" })}
              addLabel="Ajouter un chiffre"
              onChange={(next) => setField("stats", next)}
              renderItem={(s, update) => (
                <>
                  <Input placeholder="ex. 10K+" value={s.value ?? ""} onChange={(e) => update({ value: e.target.value })} />
                  <Input placeholder="ex. Clients" value={s.label ?? ""} onChange={(e) => update({ label: e.target.value })} />
                </>
              )}
            />
          </div>
        </>
      )}

      {/* VIDEO FULLSCREEN */}
      {scene.scene_type === "video-fullscreen" && (
        <>
          {generic}
          <div>
            <Label className="text-xs">URL vidéo (mp4 / webm)</Label>
            <Input
              placeholder="https://…/video.mp4"
              value={c.videoUrl ?? ""}
              onChange={(e) => setField("videoUrl", e.target.value)}
            />
          </div>
          <ImageField
            boutiqueId={boutiqueId}
            label="Image poster (avant lecture)"
            value={c.poster}
            onChange={(url) => setField("poster", url)}
            aspect="16:9"
            promptHint="Aperçu fixe de la vidéo"
          />
        </>
      )}

      {/* BANNER PROMO */}
      {scene.scene_type === "banner-promo" && (
        <>
          <div>
            <Label className="text-xs">Texte</Label>
            <Input value={c.text ?? ""} onChange={(e) => setField("text", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Libellé CTA</Label>
              <Input value={c.ctaLabel ?? ""} onChange={(e) => setField("ctaLabel", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">URL CTA</Label>
              <Input value={c.ctaUrl ?? ""} onChange={(e) => setField("ctaUrl", e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Couleur</Label>
            <Select value={c.bgColor ?? "primary"} onValueChange={(v) => setField("bgColor", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primaire</SelectItem>
                <SelectItem value="accent">Accent</SelectItem>
                <SelectItem value="ink">Encre (foncé)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* STORY SCROLLY */}
      {scene.scene_type === "story-scrolly" && (
        <div>
          <Label className="text-xs mb-2 block">Chapitres</Label>
          <ListEditor
            items={(c.chapters ?? []) as Array<Record<string, any>>}
            factory={() => ({ eyebrow: "Chapitre", title: "", body: "", image: null })}
            addLabel="Ajouter un chapitre"
            onChange={(next) => setField("chapters", next)}
            renderItem={(ch, update) => (
              <>
                <Input
                  placeholder="Eyebrow"
                  value={ch.eyebrow ?? ""}
                  onChange={(e) => update({ eyebrow: e.target.value })}
                />
                <Input
                  placeholder="Titre"
                  value={ch.title ?? ""}
                  onChange={(e) => update({ title: e.target.value })}
                />
                <Textarea
                  rows={2}
                  placeholder="Texte"
                  value={ch.body ?? ""}
                  onChange={(e) => update({ body: e.target.value })}
                />
                <ImageField
                  boutiqueId={boutiqueId}
                  label="Visuel du chapitre"
                  value={ch.image}
                  onChange={(url) => update({ image: url })}
                  aspect="3:4"
                  promptHint={ch.title || "Visuel narratif"}
                />
              </>
            )}
          />
        </div>
      )}

      {/* LOOKBOOK */}
      {scene.scene_type === "lookbook-parallax" && (
        <>
          {generic}
          <div>
            <Label className="text-xs mb-2 block">Visuels du lookbook</Label>
            <ListEditor
              items={((c.images ?? []) as string[]).map((url) => ({ url }))}
              factory={() => ({ url: "" })}
              addLabel="Ajouter un visuel"
              onChange={(next) => setField("images", next.map((x) => x.url).filter(Boolean))}
              renderItem={(item, update) => (
                <ImageField
                  boutiqueId={boutiqueId}
                  label="Visuel"
                  value={item.url}
                  onChange={(url) => update({ url: url ?? "" })}
                  aspect="3:4"
                  promptHint="Visuel lookbook éditorial"
                />
              )}
            />
          </div>
        </>
      )}

      {/* TRUST WALL */}
      {scene.scene_type === "trust-wall" && (
        <>
          {generic}
          <div>
            <Label className="text-xs mb-2 block">Avis clients</Label>
            <ListEditor
              items={(c.reviews ?? []) as Array<Record<string, any>>}
              factory={() => ({ author: "", quote: "", rating: 5 })}
              addLabel="Ajouter un avis"
              onChange={(next) => setField("reviews", next)}
              renderItem={(r, update) => (
                <>
                  <Input
                    placeholder="Auteur"
                    value={r.author ?? ""}
                    onChange={(e) => update({ author: e.target.value })}
                  />
                  <Textarea
                    rows={2}
                    placeholder="Citation"
                    value={r.quote ?? ""}
                    onChange={(e) => update({ quote: e.target.value })}
                  />
                </>
              )}
            />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Badges (un par ligne)</Label>
            <Textarea
              rows={3}
              value={(c.badges ?? []).join("\n")}
              onChange={(e) =>
                setField(
                  "badges",
                  e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                )
              }
            />
          </div>
        </>
      )}

      {/* FAQ */}
      {scene.scene_type === "faq-accordion" && (
        <>
          {generic}
          <div>
            <Label className="text-xs mb-2 block">Questions / Réponses</Label>
            <ListEditor
              items={(c.items ?? []) as Array<Record<string, any>>}
              factory={() => ({ q: "", a: "" })}
              addLabel="Ajouter une question"
              onChange={(next) => setField("items", next)}
              renderItem={(it, update) => (
                <>
                  <Input
                    placeholder="Question"
                    value={it.q ?? ""}
                    onChange={(e) => update({ q: e.target.value })}
                  />
                  <Textarea
                    rows={2}
                    placeholder="Réponse"
                    value={it.a ?? ""}
                    onChange={(e) => update({ a: e.target.value })}
                  />
                </>
              )}
            />
          </div>
        </>
      )}

      {/* COMPARISON */}
      {scene.scene_type === "comparison-table" && (
        <>
          {generic}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Notre nom</Label>
              <Input
                value={c.brand_name ?? ""}
                onChange={(e) => setField("brand_name", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Concurrent</Label>
              <Input
                value={c.competitor_name ?? ""}
                onChange={(e) => setField("competitor_name", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-2 block">Lignes de comparaison</Label>
            <ListEditor
              items={(c.rows ?? []) as Array<Record<string, any>>}
              factory={() => ({ label: "", us: true, them: false })}
              addLabel="Ajouter une ligne"
              onChange={(next) => setField("rows", next)}
              renderItem={(r, update) => (
                <>
                  <Input
                    placeholder="Critère"
                    value={r.label ?? ""}
                    onChange={(e) => update({ label: e.target.value })}
                  />
                  <div className="flex gap-3 text-xs">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!!r.us}
                        onChange={(e) => update({ us: e.target.checked })}
                      />
                      Nous
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!!r.them}
                        onChange={(e) => update({ them: e.target.checked })}
                      />
                      Eux
                    </label>
                  </div>
                </>
              )}
            />
          </div>
        </>
      )}

      {/* FOUNDER */}
      {scene.scene_type === "founder-letter" && (
        <>
          {generic}
          {"eyebrow" in c && (
            <div>
              <Label className="text-xs">Eyebrow</Label>
              <Input
                value={c.eyebrow ?? ""}
                onChange={(e) => setField("eyebrow", e.target.value)}
              />
            </div>
          )}
          <div>
            <Label className="text-xs">Texte de la lettre</Label>
            <Textarea
              rows={5}
              value={c.body ?? ""}
              onChange={(e) => setField("body", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Signature</Label>
            <Input
              value={c.signature ?? ""}
              onChange={(e) => setField("signature", e.target.value)}
            />
          </div>
          <ImageField
            boutiqueId={boutiqueId}
            label="Portrait du fondateur"
            value={c.portraitUrl}
            onChange={(url) => setField("portraitUrl", url)}
            aspect="1:1"
            promptHint="Portrait professionnel du fondateur"
          />
        </>
      )}

      {/* MANIFESTO */}
      {scene.scene_type === "manifesto-typographic" && (
        <>
          <div>
            <Label className="text-xs mb-2 block">Lignes du manifeste</Label>
            <ListEditor
              items={((c.lines ?? []) as string[]).map((line) => ({ line }))}
              factory={() => ({ line: "" })}
              addLabel="Ajouter une ligne"
              onChange={(next) => setField("lines", next.map((x) => x.line))}
              renderItem={(item, update) => (
                <Input
                  placeholder="Une affirmation forte"
                  value={item.line ?? ""}
                  onChange={(e) => update({ line: e.target.value })}
                />
              )}
            />
          </div>
          <div>
            <Label className="text-xs">Note de bas</Label>
            <Input
              value={c.footnote ?? ""}
              onChange={(e) => setField("footnote", e.target.value)}
            />
          </div>
        </>
      )}

      {/* PRESS */}
      {scene.scene_type === "press-strip" && (
        <div>
          <Label className="text-xs">Eyebrow</Label>
          <Input
            value={c.eyebrow ?? ""}
            onChange={(e) => setField("eyebrow", e.target.value)}
          />
          <Label className="text-xs mt-3 mb-2 block">Médias (un par ligne)</Label>
          <Textarea
            rows={4}
            value={(c.logos ?? []).map((l: any) => l.name).join("\n")}
            onChange={(e) =>
              setField(
                "logos",
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((name) => ({ name, url: null })),
              )
            }
          />
        </div>
      )}

      {/* NEWSLETTER */}
      {scene.scene_type === "newsletter-editorial" && (
        <>
          <div>
            <Label className="text-xs">Eyebrow</Label>
            <Input
              value={c.eyebrow ?? ""}
              onChange={(e) => setField("eyebrow", e.target.value)}
            />
          </div>
          {generic}
          <div>
            <Label className="text-xs">Bénéfices (un par ligne)</Label>
            <Textarea
              rows={3}
              value={(c.benefits ?? []).join("\n")}
              onChange={(e) =>
                setField(
                  "benefits",
                  e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                )
              }
            />
          </div>
        </>
      )}

      {/* PRODUCTS GRID */}
      {scene.scene_type === "products-grid" && (
        <>
          {generic}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Disposition</Label>
              <Select value={c.layout || "3-up"} onValueChange={(v) => setField("layout", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-up">2 colonnes</SelectItem>
                  <SelectItem value="3-up">3 colonnes</SelectItem>
                  <SelectItem value="4-up">4 colonnes</SelectItem>
                  <SelectItem value="compact">Compact (5 col)</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                  <SelectItem value="carousel">Carrousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Forme du cadre</Label>
              <Select value={c.cardShape ?? "rounded"} onValueChange={(v) => setField("cardShape", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Carré</SelectItem>
                  <SelectItem value="rounded">Arrondi</SelectItem>
                  <SelectItem value="rounded-xl">Très arrondi</SelectItem>
                  <SelectItem value="circle">Cercle</SelectItem>
                  <SelectItem value="arch">Arche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Effet au survol</Label>
            <Select value={c.hoverEffect ?? "zoom"} onValueChange={(v) => setField("hoverEffect", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                <SelectItem value="zoom">Zoom doux</SelectItem>
                <SelectItem value="shine">Brillance</SelectItem>
                <SelectItem value="tilt">Tilt 3D</SelectItem>
                <SelectItem value="lift">Soulèvement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {products.length > 0 && (
            <div>
              <Label className="text-xs flex items-center justify-between mb-1">
                <span>Produits affichés</span>
                <button
                  type="button"
                  onClick={() => setField("productIds", [])}
                  className="text-[10px] text-primary hover:underline"
                >
                  Tout afficher
                </button>
              </Label>
              <div className="max-h-48 overflow-auto rounded border border-border/40 p-2 space-y-1">
                {products.map((p) => {
                  const ids = (c.productIds ?? []) as string[];
                  const allSelected = ids.length === 0;
                  const checked = allSelected || ids.includes(p.id);
                  return (
                    <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const current = allSelected ? products.map((x) => x.id) : ids;
                          const next = e.target.checked
                            ? Array.from(new Set([...current, p.id]))
                            : current.filter((x) => x !== p.id);
                          // If next == all, store [] (= afficher tout)
                          setField("productIds", next.length === products.length ? [] : next);
                        }}
                      />
                      {p.image_url && (
                        <span
                          className="w-6 h-6 rounded bg-muted bg-cover bg-center shrink-0"
                          style={{ backgroundImage: `url(${p.image_url})` }}
                        />
                      )}
                      <span className="truncate">{p.name}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-[10px] opacity-50 mt-1">
                Décoche pour limiter à une sélection. Vide = tout afficher.
              </p>
            </div>
          )}
        </>
      )}

      {/* PRODUCT — DESCRIPTION */}
      {scene.scene_type === "product-description" && (
        <>
          <div>
            <Label className="text-xs">Titre</Label>
            <Input value={c.title ?? ""} onChange={(e) => setField("title", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Texte de secours</Label>
            <Textarea
              rows={4}
              value={c.fallbackBody ?? ""}
              onChange={(e) => setField("fallbackBody", e.target.value)}
            />
            <p className="text-[10px] opacity-50 mt-1">Affiché si la fiche produit n'a pas de description.</p>
          </div>
        </>
      )}

      {/* PRODUCT — SPECS */}
      {scene.scene_type === "product-specs" && (
        <>
          <div>
            <Label className="text-xs">Titre</Label>
            <Input value={c.title ?? ""} onChange={(e) => setField("title", e.target.value)} />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Lignes (label / valeur)</Label>
            <ListEditor
              items={(c.rows ?? []) as Array<Record<string, any>>}
              factory={() => ({ label: "", value: "" })}
              addLabel="Ajouter une ligne"
              onChange={(next) => setField("rows", next)}
              renderItem={(r, update) => (
                <>
                  <Input placeholder="Label" value={r.label ?? ""} onChange={(e) => update({ label: e.target.value })} />
                  <Input placeholder="Valeur" value={r.value ?? ""} onChange={(e) => update({ value: e.target.value })} />
                </>
              )}
            />
          </div>
        </>
      )}

      {/* PRODUCT — HERO / RELATED — generic only */}
      {(scene.scene_type === "product-hero" || scene.scene_type === "product-related") && (
        <>
          {"title" in c && (
            <div>
              <Label className="text-xs">Titre</Label>
              <Input value={c.title ?? ""} onChange={(e) => setField("title", e.target.value)} />
            </div>
          )}
          {"ctaLabel" in c && (
            <div>
              <Label className="text-xs">CTA</Label>
              <Input value={c.ctaLabel ?? ""} onChange={(e) => setField("ctaLabel", e.target.value)} />
            </div>
          )}
          {scene.scene_type === "product-related" && (
            <div>
              <Label className="text-xs">Nombre de produits</Label>
              <Input
                type="number"
                min={2}
                max={12}
                value={c.limit ?? 4}
                onChange={(e) => setField("limit", Math.max(2, Math.min(12, Number(e.target.value) || 4)))}
              />
            </div>
          )}
        </>
      )}

      {/* Default — generic only */}
      {![
        "hero-cinema",
        "story-scrolly",
        "lookbook-parallax",
        "trust-wall",
        "faq-accordion",
        "comparison-table",
        "founder-letter",
        "manifesto-typographic",
        "press-strip",
        "newsletter-editorial",
        "showcase-magazine",
        "marquee-strip",
        "gallery-mosaic",
        "stats-counter",
        "video-fullscreen",
        "banner-promo",
        "products-grid",
        "product-description",
        "product-specs",
        "product-hero",
        "product-related",
      ].includes(scene.scene_type) && generic}
    </Card>
  );
}