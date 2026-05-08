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
import { Trash2, Plus, Wand2, Image as ImageIcon, Upload, Loader2, Sparkles } from "lucide-react";
import { ALL_FONTS, loadGoogleFont } from "@/lib/googleFonts";
import { toast } from "sonner";
import { findSceneDefinition, type SceneRecord } from "@/lib/studioScenes";
import {
  useGenerateSceneImage,
  useUploadSceneAsset,
} from "@/hooks/useBrandStudio";
import { ActionButton, stateFromMutation } from "./ActionButton";

type Patch = Partial<Pick<SceneRecord, "content" | "variant" | "is_visible">>;

interface Props {
  scene: SceneRecord;
  boutiqueId: string;
  onPatch: (p: Patch) => void;
  onDelete: () => void;
  onRemix: () => void;
  remixState?: "idle" | "loading" | "success" | "error";
}

/** Champ image avec upload + génération IA. */
function ImageField({
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
      const url = await upload.mutateAsync({ boutiqueId, file: f });
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
}: Props) {
  const def = findSceneDefinition(scene.scene_type);
  const c = scene.content as Record<string, any>;
  const setField = (key: string, value: unknown) =>
    onPatch({ content: { ...c, [key]: value } });

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
      ].includes(scene.scene_type) && generic}
    </Card>
  );
}