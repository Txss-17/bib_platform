import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Wand2,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useBoutiqueScenes,
  useBrandDNA,
  useUpdateScene,
  useReorderScenes,
  useAddScene,
  useDeleteScene,
  useGenerateSeo,
  useSaveSeo,
  type SeoCopilotResult,
} from "@/hooks/useBrandStudio";
import {
  STUDIO_SCENES,
  findSceneDefinition,
  type SceneRecord,
  type SceneRole,
} from "@/lib/studioScenes";
import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  boutiqueId: string;
  boutiqueName: string;
  category: string;
  products: Array<{ id: string; name: string; price: number; image_url?: string | null }>;
  publicSlug?: string;
  isPublished: boolean;
  initialSeo?: {
    title?: string | null;
    description?: string | null;
    jsonld?: { blocks?: Array<Record<string, unknown>>; keywords?: string[]; h1?: string | null } | null;
  };
}

export function StudioEditor({
  boutiqueId,
  boutiqueName,
  category,
  products,
  publicSlug,
  isPublished,
  initialSeo,
}: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: brandDna } = useBrandDNA(boutiqueId);
  const { data: scenes = [], isLoading } = useBoutiqueScenes(boutiqueId);
  const updateScene = useUpdateScene();
  const reorder = useReorderScenes();
  const addScene = useAddScene();
  const removeScene = useDeleteScene();
  const seoMut = useGenerateSeo();
  const seoSave = useSaveSeo();

  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showPublishErrors, setShowPublishErrors] = useState(false);

  // SEO local state — editable fields persisted via useSaveSeo
  const [seoTitle, setSeoTitle] = useState(initialSeo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(initialSeo?.description ?? "");
  const [seoKeywords, setSeoKeywords] = useState<string>(
    (initialSeo?.jsonld?.keywords ?? []).join(", "),
  );
  const [seoH1, setSeoH1] = useState<string>(initialSeo?.jsonld?.h1 ?? "");
  const [seoJsonld, setSeoJsonld] = useState<Array<Record<string, unknown>>>(
    initialSeo?.jsonld?.blocks ?? [],
  );
  const [seoDirty, setSeoDirty] = useState(false);
  useEffect(() => {
    setSeoDirty(false);
  }, [boutiqueId]);

  const activeScene = useMemo(
    () => scenes.find((s) => s.id === activeSceneId) ?? scenes[0] ?? null,
    [scenes, activeSceneId],
  );

  // ---------------- Pre-publish validation ----------------
  const validation = useMemo(() => {
    const errors: string[] = [];
    const visible = scenes.filter((s) => s.is_visible);
    if (visible.length < 3) {
      errors.push("Au moins 3 scènes visibles sont requises (Hero, Vitrine, CTA recommandés).");
    }
    const requiredRoles: SceneRole[] = ["hero", "showcase", "cta"];
    for (const r of requiredRoles) {
      if (!visible.some((s) => s.role === r)) {
        errors.push(`Scène manquante : ${r === "hero" ? "Hero" : r === "showcase" ? "Vitrine produits" : "Appel à l'action"}.`);
      }
    }
    // Hero content sanity
    const hero = visible.find((s) => s.role === "hero");
    if (hero) {
      const c = hero.content as Record<string, unknown>;
      if (!c.title || (c.title as string).trim().length < 5)
        errors.push("Le titre du Hero doit faire au moins 5 caractères.");
      // If hero has a videoUrl key declared, require it present
      if ("videoUrl" in c && hero.variant === "fullscreen" && !c.backgroundImage && !c.videoUrl) {
        errors.push("Hero plein écran : ajoute une image ou une vidéo de fond.");
      }
    }
    // Showcase needs products
    if (visible.some((s) => s.role === "showcase") && products.length === 0) {
      errors.push("La Vitrine est activée mais aucun produit actif n'est disponible.");
    }
    // SEO
    if (!seoTitle || seoTitle.trim().length < 10)
      errors.push("Le titre SEO doit faire au moins 10 caractères.");
    if (seoTitle.length > 60)
      errors.push("Le titre SEO ne doit pas dépasser 60 caractères.");
    if (!seoDescription || seoDescription.trim().length < 50)
      errors.push("La meta description doit faire au moins 50 caractères.");
    if (seoDescription.length > 160)
      errors.push("La meta description ne doit pas dépasser 160 caractères.");
    return { errors, ok: errors.length === 0 };
  }, [scenes, products, seoTitle, seoDescription]);

  const publish = useMutation({
    mutationFn: async () => {
      if (!validation.ok) throw new Error("validation_failed");
      // Persist any pending SEO before publishing
      if (seoDirty) {
        await seoSave.mutateAsync({
          boutiqueId,
          title: seoTitle,
          description: seoDescription,
          h1: seoH1 || undefined,
          keywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          jsonld: seoJsonld,
        });
        setSeoDirty(false);
      }
      const { error } = await supabase
        .from("boutiques")
        .update({ status: "published" })
        .eq("id", boutiqueId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Boutique publiée !");
      qc.invalidateQueries({ queryKey: ["boutique-edit", boutiqueId] });
      qc.invalidateQueries({ queryKey: ["boutiques"] });
    },
    onError: (e: unknown) => {
      if (e instanceof Error && e.message === "validation_failed") {
        setShowPublishErrors(true);
      } else {
        toast.error("Erreur lors de la publication");
      }
    },
  });

  const handleMove = (sceneId: string, dir: -1 | 1) => {
    if (reorder.isPending) return;
    const idx = scenes.findIndex((s) => s.id === sceneId);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= scenes.length) return;
    const list = scenes.slice();
    const [it] = list.splice(idx, 1);
    list.splice(next, 0, it);
    reorder.mutate(
      { boutiqueId, orderedIds: list.map((s) => s.id) },
      { onError: () => toast.error("Réorganisation impossible, réessayez.") },
    );
  };

  const handleAdd = (sceneType: string) => {
    if (addScene.isPending) return;
    addScene.mutate(
      { boutiqueId, sceneType, position: scenes.length },
      {
        onSuccess: () => {
          toast.success("Scène ajoutée");
          setShowAdd(false);
        },
        onError: () => toast.error("Impossible d'ajouter la scène"),
      },
    );
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    removeScene.mutate(
      { sceneId: pendingDeleteId, boutiqueId },
      {
        onSuccess: () => {
          toast.success("Scène supprimée");
          if (activeSceneId === pendingDeleteId) setActiveSceneId(null);
        },
        onError: () => toast.error("Suppression impossible"),
      },
    );
    setPendingDeleteId(null);
  };

  const handleSeoGenerate = () => {
    seoMut.mutate(
      {
        boutiqueId,
        context: {
          boutique_name: boutiqueName,
          category,
          tagline: brandDna?.generated_copy?.tagline,
          ambiance: brandDna?.ambiance,
          target_audience: brandDna?.target_audience,
          keywords: brandDna?.keywords,
          products: products.slice(0, 6).map((p) => ({ name: p.name, price: p.price })),
          page_kind: "store_home",
        },
      },
      {
        onSuccess: (r: SeoCopilotResult) => {
          setSeoTitle(r.title);
          setSeoDescription(r.description);
          setSeoH1(r.h1);
          setSeoKeywords(r.keywords.join(", "));
          setSeoJsonld(r.jsonld);
          setSeoDirty(false);
          toast.success("SEO généré et appliqué");
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erreur SEO"),
      },
    );
  };

  const handleSeoSave = () => {
    seoSave.mutate(
      {
        boutiqueId,
        title: seoTitle,
        description: seoDescription,
        h1: seoH1 || undefined,
        keywords: seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        jsonld: seoJsonld,
      },
      {
        onSuccess: () => {
          setSeoDirty(false);
          toast.success("SEO enregistré");
        },
        onError: () => toast.error("Sauvegarde SEO impossible"),
      },
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 h-[calc(100vh-72px)]">
      {/* ---------------- Left rail ---------------- */}
      <aside className="border-r border-border/60 bg-muted/30 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-border/40">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/boutiques")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            {publicSlug && (
              <Button asChild variant="outline" size="sm">
                <a href={`/b/${publicSlug}`} target="_blank" rel="noreferrer">
                  <Eye className="w-4 h-4 mr-1" /> Voir
                </a>
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => publish.mutate()}
              disabled={publish.isPending}
              variant={isPublished ? "outline" : "default"}
            >
              {publish.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Globe className="w-4 h-4 mr-1" />
              )}
              {isPublished ? "Republier" : "Publier"}
            </Button>
          </div>
        </div>

        {validation.errors.length > 0 && (
          <div className="mx-4 mt-3 rounded-md border border-warning/40 bg-warning/10 p-2 text-xs flex gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
            <span>
              <strong>{validation.errors.length}</strong> point(s) à corriger avant publication.
            </span>
          </div>
        )}
        {validation.ok && (
          <div className="mx-4 mt-3 rounded-md border border-success/40 bg-success/10 p-2 text-xs flex gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
            <span>Boutique prête à être publiée.</span>
          </div>
        )}

        <Tabs defaultValue="scenes" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 grid grid-cols-3">
            <TabsTrigger value="scenes">Scènes</TabsTrigger>
            <TabsTrigger value="brand">Identité</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* SCENES TAB */}
          <TabsContent value="scenes" className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 mt-3">
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin opacity-50" />
              </div>
            )}
            {scenes.map((s, i) => {
              const def = findSceneDefinition(s.scene_type);
              const isActive = activeScene?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSceneId(s.id)}
                  className={`group cursor-pointer rounded-lg border p-3 flex items-start gap-2 transition ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-border bg-card"
                  }`}
                >
                  <GripVertical className="w-4 h-4 mt-0.5 opacity-30" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{def?.name ?? s.scene_type}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {s.role}
                      </Badge>
                      {!s.is_visible && (
                        <Badge variant="secondary" className="text-[10px]">Masqué</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {def?.tagline}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMove(s.id, -1); }}
                      disabled={i === 0}
                      className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMove(s.id, 1); }}
                      disabled={i === scenes.length - 1}
                      className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {!showAdd ? (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 mr-1" /> Ajouter une scène
              </Button>
            ) : (
              <Card className="p-3 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bibliothèque
                </p>
                {STUDIO_SCENES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleAdd(d.id)}
                    className="w-full text-left p-2 rounded hover:bg-muted text-sm flex items-center justify-between"
                  >
                    <span>
                      <span className="font-medium block">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{d.tagline}</span>
                    </span>
                    <Plus className="w-4 h-4 opacity-50" />
                  </button>
                ))}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAdd(false)}>
                  Annuler
                </Button>
              </Card>
            )}

            {activeScene && (
              <SceneInspector
                key={activeScene.id}
                scene={activeScene}
                onPatch={(patch) =>
                  updateScene.mutate({
                    sceneId: activeScene.id,
                    boutiqueId,
                    patch,
                  })
                }
                onDelete={() => {
                  if (!confirm("Supprimer cette scène ?")) return;
                  removeScene.mutate(
                    { sceneId: activeScene.id, boutiqueId },
                    { onSuccess: () => setActiveSceneId(null) },
                  );
                }}
              />
            )}
          </TabsContent>

          {/* BRAND TAB */}
          <TabsContent value="brand" className="flex-1 overflow-y-auto px-4 pb-6 mt-3 space-y-4">
            {!brandDna ? (
              <p className="text-sm text-muted-foreground">
                Identité non générée. Relance le Brand Studio depuis l'onglet d'onboarding.
              </p>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Tagline</Label>
                  <p className="font-medium">{brandDna.generated_copy?.tagline}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Ambiance</Label>
                  <p>{brandDna.ambiance}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Ton</Label>
                  <p>{brandDna.tone}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Palette</Label>
                  <div className="flex gap-2 mt-1">
                    {(["primary", "accent", "surface", "ink"] as const).map((k) => {
                      const v = (brandDna.generated_palette as never)[k] as string | undefined;
                      return (
                        <div key={k} className="flex-1 text-center">
                          <div
                            className="h-10 rounded border"
                            style={{ background: v ? `hsl(${v})` : "transparent" }}
                          />
                          <span className="text-[10px] opacity-60">{k}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Mots-clés</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(brandDna.keywords ?? []).map((k) => (
                      <Badge key={k} variant="outline">{k}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* SEO TAB */}
          <TabsContent value="seo" className="flex-1 overflow-y-auto px-4 pb-6 mt-3 space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">SEO Copilot</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Génère titre, méta, mots-clés longue traîne et JSON-LD enrichi à partir de l'identité de marque et des produits.
              </p>
              <Button
                onClick={handleSeoGenerate}
                disabled={seoMut.isPending}
                className="w-full"
              >
                {seoMut.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération…</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Générer le SEO de la page</>
                )}
              </Button>
            </Card>

            {seoResult && (
              <Card className="p-4 space-y-3 text-sm">
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Title ({seoResult.title.length}/60)</Label>
                  <p className="font-medium">{seoResult.title}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Meta description ({seoResult.description.length}/160)</Label>
                  <p className="text-muted-foreground">{seoResult.description}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">H1</Label>
                  <p>{seoResult.h1}</p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Mots-clés</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {seoResult.keywords.map((k) => (
                      <Badge key={k} variant="outline">{k}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">
                    JSON-LD ({seoResult.jsonld.length} bloc{seoResult.jsonld.length > 1 ? "s" : ""})
                  </Label>
                  <pre className="text-[10px] bg-muted/50 rounded p-2 max-h-40 overflow-auto mt-1">
                    {JSON.stringify(seoResult.jsonld, null, 2)}
                  </pre>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </aside>

      {/* ---------------- Live preview ---------------- */}
      <div className="overflow-y-auto bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/40 px-4 py-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide opacity-60">Aperçu en direct</span>
          <span className="text-xs opacity-50">{scenes.length} scène{scenes.length > 1 ? "s" : ""}</span>
        </div>
        <StudioSceneRenderer
          scenes={scenes}
          brandDna={brandDna ?? null}
          boutiqueName={boutiqueName}
          products={products}
        />
      </div>
    </div>
  );
}

/* ----------------------- Inspector ----------------------- */

function SceneInspector({
  scene,
  onPatch,
  onDelete,
}: {
  scene: SceneRecord;
  onPatch: (patch: Partial<Pick<SceneRecord, "content" | "variant" | "is_visible">>) => void;
  onDelete: () => void;
}) {
  const def = findSceneDefinition(scene.scene_type);
  const c = scene.content as Record<string, unknown>;

  const setField = (key: string, value: unknown) =>
    onPatch({ content: { ...c, [key]: value } });

  return (
    <Card className="p-3 mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-60">Inspecteur</p>
          <p className="text-sm font-semibold">{def?.name}</p>
        </div>
        <div className="flex items-center gap-1">
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
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {def.variants.map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <ContentFields sceneType={scene.scene_type} content={c} setField={setField} />
    </Card>
  );
}

function ContentFields({
  sceneType,
  content,
  setField,
}: {
  sceneType: string;
  content: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  const get = (k: string) => (content[k] ?? "") as string;

  // Generic title/subtitle/cta editor for most scenes
  const generic = (
    <>
      {"title" in content && (
        <div>
          <Label className="text-xs">Titre</Label>
          <Input value={get("title")} onChange={(e) => setField("title", e.target.value)} />
        </div>
      )}
      {"subtitle" in content && (
        <div>
          <Label className="text-xs">Sous-titre</Label>
          <Textarea
            rows={2}
            value={get("subtitle")}
            onChange={(e) => setField("subtitle", e.target.value)}
          />
        </div>
      )}
      {"ctaLabel" in content && (
        <div>
          <Label className="text-xs">CTA principal</Label>
          <Input value={get("ctaLabel")} onChange={(e) => setField("ctaLabel", e.target.value)} />
        </div>
      )}
      {"ctaSecondaryLabel" in content && (
        <div>
          <Label className="text-xs">CTA secondaire</Label>
          <Input
            value={get("ctaSecondaryLabel")}
            onChange={(e) => setField("ctaSecondaryLabel", e.target.value)}
          />
        </div>
      )}
    </>
  );

  if (sceneType === "story-scrolly") {
    const chapters = (content.chapters ?? []) as Array<Record<string, string>>;
    return (
      <div className="space-y-3">
        {chapters.map((ch, i) => (
          <div key={i} className="rounded border border-border/40 p-2 space-y-1.5">
            <Label className="text-xs">Chapitre {i + 1}</Label>
            <Input
              placeholder="Eyebrow"
              value={ch.eyebrow ?? ""}
              onChange={(e) => {
                const next = chapters.slice();
                next[i] = { ...ch, eyebrow: e.target.value };
                setField("chapters", next);
              }}
            />
            <Input
              placeholder="Titre"
              value={ch.title ?? ""}
              onChange={(e) => {
                const next = chapters.slice();
                next[i] = { ...ch, title: e.target.value };
                setField("chapters", next);
              }}
            />
            <Textarea
              rows={2}
              placeholder="Texte"
              value={ch.body ?? ""}
              onChange={(e) => {
                const next = chapters.slice();
                next[i] = { ...ch, body: e.target.value };
                setField("chapters", next);
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (sceneType === "trust-wall") {
    const reviews = (content.reviews ?? []) as Array<Record<string, string>>;
    return (
      <>
        {generic}
        <div className="space-y-2">
          <Label className="text-xs">Avis clients</Label>
          {reviews.map((r, i) => (
            <div key={i} className="rounded border border-border/40 p-2 space-y-1">
              <Input
                placeholder="Auteur"
                value={r.author ?? ""}
                onChange={(e) => {
                  const next = reviews.slice();
                  next[i] = { ...r, author: e.target.value };
                  setField("reviews", next);
                }}
              />
              <Textarea
                rows={2}
                placeholder="Citation"
                value={r.quote ?? ""}
                onChange={(e) => {
                  const next = reviews.slice();
                  next[i] = { ...r, quote: e.target.value };
                  setField("reviews", next);
                }}
              />
            </div>
          ))}
        </div>
      </>
    );
  }

  return <div className="space-y-3">{generic}</div>;
}