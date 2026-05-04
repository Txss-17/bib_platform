import { useEffect, useMemo, useRef, useState } from "react";
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
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionButton, stateFromMutation } from "./ActionButton";
import { EDITOR_ROUTES, canPreviewStorefront } from "@/lib/editorRoutes";
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
  useRemixScene,
  useGenerateContentBrief,
  useGenerateKeywordClusters,
  computeSeoScore,
  type ContentBrief,
  type KeywordCluster,
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
  const briefMut = useGenerateContentBrief();
  const clustersMut = useGenerateKeywordClusters();
  const remixMut = useRemixScene();

  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [clusters, setClusters] = useState<KeywordCluster[]>([]);
  const SEO_MIN_SCORE = 60;

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
      // Hero plein écran : exige soit une image soit une vidéo de fond
      if (hero.variant === "fullscreen" && !c.backgroundImage && !c.videoUrl) {
        errors.push("Hero plein écran : ajoute une image OU une vidéo de fond.");
      }
      if (!c.ctaLabel || (c.ctaLabel as string).trim().length < 2) {
        errors.push("Le CTA principal du Hero est requis.");
      }
    }
    // Other scene sanity (mandatory video on lookbook video variant if added later, FAQ requires items, etc.)
    const faq = visible.find((s) => s.scene_type === "faq-accordion");
    if (faq) {
      const items = ((faq.content as any).items ?? []) as Array<{ q: string; a: string }>;
      if (items.length < 2) errors.push("La FAQ doit contenir au moins 2 questions.");
      if (items.some((it) => !it.q?.trim() || !it.a?.trim()))
        errors.push("Toutes les questions FAQ doivent avoir une réponse.");
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

  // Ref read by the publish mutation — populated by an effect once `fullValidation` is computed.
  const publishGateRef = useRef<{ ok: boolean; errors: string[] }>({ ok: false, errors: [] });

  const publish = useMutation({
    mutationFn: async () => {
      if (!publishGateRef.current.ok) throw new Error("validation_failed");
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

  const seoKeywordsList = useMemo(
    () => seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
    [seoKeywords],
  );
  const seoScore = useMemo(
    () =>
      computeSeoScore({
        title: seoTitle,
        description: seoDescription,
        h1: seoH1,
        keywords: seoKeywordsList,
        jsonldBlocks: seoJsonld.length,
      }),
    [seoTitle, seoDescription, seoH1, seoKeywordsList, seoJsonld.length],
  );

  // Combine base validation + SEO score threshold for publishing
  const fullValidation = useMemo(() => {
    const errors = [...validation.errors];
    if (seoScore.score < SEO_MIN_SCORE) {
      errors.push(
        `Score SEO insuffisant : ${seoScore.score}/100 (minimum requis : ${SEO_MIN_SCORE}). Améliorez les points listés dans l'onglet SEO.`,
      );
    }
    return { errors, ok: errors.length === 0 };
  }, [validation, seoScore, SEO_MIN_SCORE]);

  useEffect(() => {
    publishGateRef.current = fullValidation;
  }, [fullValidation]);

  const seoContext = useMemo(
    () => ({
      boutique_name: boutiqueName,
      category,
      tagline: brandDna?.generated_copy?.tagline,
      ambiance: brandDna?.ambiance,
      tone: brandDna?.tone,
      target_audience: brandDna?.target_audience,
      keywords: brandDna?.keywords,
      products: products.slice(0, 10).map((p) => ({ name: p.name, price: p.price })),
    }),
    [boutiqueName, category, brandDna, products],
  );

  const handleBriefGenerate = () => {
    briefMut.mutate(
      { boutiqueId, context: { ...seoContext, page_kind: "store_home", target_keyword: seoKeywordsList[0] } },
      {
        onSuccess: (b) => {
          setBrief(b);
          toast.success("Content brief généré");
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erreur brief"),
      },
    );
  };

  const handleClustersGenerate = () => {
    clustersMut.mutate(
      { boutiqueId, context: seoContext },
      {
        onSuccess: (c) => {
          setClusters(c);
          toast.success(`${c.length} clusters générés`);
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erreur clusters"),
      },
    );
  };

  // ---------------- Keyword cluster add/remove with undo ----------------
  const addKeyword = (k: string) => {
    const trimmed = k.trim();
    if (!trimmed) return;
    if (seoKeywordsList.includes(trimmed)) return;
    const next = [...seoKeywordsList, trimmed];
    setSeoKeywords(next.join(", "));
    setSeoDirty(true);
    toast.success(`« ${trimmed} » ajouté`, {
      action: {
        label: "Annuler",
        onClick: () => {
          setSeoKeywords(next.filter((x) => x !== trimmed).join(", "));
          setSeoDirty(true);
        },
      },
    });
  };

  const removeKeyword = (k: string) => {
    const next = seoKeywordsList.filter((x) => x !== k);
    setSeoKeywords(next.join(", "));
    setSeoDirty(true);
    toast(`« ${k} » retiré`, {
      action: {
        label: "Annuler",
        onClick: () => {
          setSeoKeywords([...next, k].join(", "));
          setSeoDirty(true);
        },
      },
    });
  };

  // ---------------- Apply Content Brief ----------------
  const applyBrief = () => {
    if (!brief) return;
    // 1. SEO H1 + (optional) keyword
    setSeoH1(brief.recommended_h1);
    if (brief.target_query) addKeyword(brief.target_query);
    setSeoDirty(true);

    // 2. Inject plan/questions into the active scene (smart by scene_type)
    const target =
      activeScene ??
      scenes.find((s) => s.scene_type === "story-scrolly") ??
      scenes.find((s) => s.scene_type === "faq-accordion") ??
      scenes[0];

    if (target) {
      const c = { ...(target.content as Record<string, unknown>) };
      let patched = false;

      if (target.scene_type === "story-scrolly") {
        c.chapters = brief.outline.slice(0, 5).map((o) => ({
          eyebrow: "Plan",
          title: o.h2,
          body: (o.talking_points ?? []).join(" · "),
          image: null,
        }));
        patched = true;
      } else if (target.scene_type === "faq-accordion") {
        c.items = brief.questions_to_answer.slice(0, 8).map((q, i) => ({
          q,
          a: brief.outline[i % Math.max(brief.outline.length, 1)]?.talking_points?.[0] ?? "",
        }));
        patched = true;
      } else {
        // Generic fallback: title = H1, subtitle = first talking point
        if ("title" in c) c.title = brief.recommended_h1;
        if ("subtitle" in c)
          c.subtitle =
            brief.outline[0]?.talking_points?.[0] ?? brief.search_intent ?? (c.subtitle as string);
        patched = "title" in c || "subtitle" in c;
      }

      if (patched) {
        updateScene.mutate({ sceneId: target.id, boutiqueId, patch: { content: c } });
      }
    }

    // 3. Always try to populate (or create-friendly toast for) FAQ scene
    const faq = scenes.find((s) => s.scene_type === "faq-accordion" && s.id !== target?.id);
    if (faq) {
      const fc = { ...(faq.content as Record<string, unknown>) };
      fc.items = brief.questions_to_answer.slice(0, 8).map((q, i) => ({
        q,
        a: brief.outline[i % Math.max(brief.outline.length, 1)]?.talking_points?.[0] ?? "",
      }));
      updateScene.mutate({ sceneId: faq.id, boutiqueId, patch: { content: fc } });
    }

    toast.success("Brief appliqué : H1, plan & questions intégrés");
  };

  const handleRemix = (scene: SceneRecord) => {
    remixMut.mutate(
      {
        boutiqueId,
        sceneId: scene.id,
        sceneType: scene.scene_type,
        variant: scene.variant,
        content: scene.content as Record<string, unknown>,
        brand: brandDna ?? null,
      },
      {
        onSuccess: () => toast.success("Scène remixée"),
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Remix impossible"),
      },
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 h-[calc(100vh-72px)]">
      {/* ---------------- Left rail ---------------- */}
      <aside className="border-r border-border/60 bg-muted/30 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-border/40">
          <Button variant="ghost" size="sm" onClick={() => navigate(EDITOR_ROUTES.boutiquesList())}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" title="Analytics Studio">
              <a href={EDITOR_ROUTES.analyticsStudio(boutiqueId)}>
                <BarChart3 className="w-4 h-4 mr-1" /> Stats
              </a>
            </Button>
            {canPreviewStorefront(publicSlug) && (
              <Button asChild variant="outline" size="sm">
                <a href={EDITOR_ROUTES.storefront(publicSlug)} target="_blank" rel="noreferrer">
                  <Eye className="w-4 h-4 mr-1" /> Voir
                </a>
              </Button>
            )}
            <ActionButton
              size="sm"
              onClick={() => publish.mutate()}
              state={stateFromMutation(publish)}
              loadingLabel="Publication…"
              successLabel={isPublished ? "Republié" : "Publié"}
              errorLabel="Échec"
              variant={isPublished ? "outline" : "default"}
            >
              <Globe className="w-4 h-4 mr-1 inline" />
              {isPublished ? "Republier" : "Publier"}
            </ActionButton>
          </div>
        </div>

        {fullValidation.errors.length > 0 && (
          <div className="mx-4 mt-3 rounded-md border border-warning/40 bg-warning/10 p-2 text-xs flex gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
            <span>
              <strong>{fullValidation.errors.length}</strong> point(s) à corriger avant publication.
            </span>
          </div>
        )}
        {fullValidation.ok && (
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
                onDelete={() => setPendingDeleteId(activeScene.id)}
                onRemix={() => handleRemix(activeScene)}
                isRemixing={remixMut.isPending}
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
            {/* Score SEO live */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Score SEO</span>
                </div>
                <span
                  className={`text-2xl font-bold tabular-nums ${
                    seoScore.score >= 80
                      ? "text-success"
                      : seoScore.score >= 50
                        ? "text-warning"
                        : "text-destructive"
                  }`}
                >
                  {seoScore.score}
                  <span className="text-xs opacity-50">/100</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                <div
                  className={`h-full transition-all ${
                    seoScore.score >= 80
                      ? "bg-success"
                      : seoScore.score >= 50
                        ? "bg-warning"
                        : "bg-destructive"
                  }`}
                  style={{ width: `${seoScore.score}%` }}
                />
              </div>
              <ul className="space-y-1">
                {seoScore.checks.map((c) => (
                  <li key={c.label} className="text-xs flex items-center gap-2">
                    {c.ok ? (
                      <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-warning shrink-0" />
                    )}
                    <span className={c.ok ? "opacity-60" : ""}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">SEO Copilot</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Génère titre, méta, mots-clés longue traîne et JSON-LD enrichi à partir de l'identité de marque et des produits.
              </p>
              <ActionButton
                onClick={handleSeoGenerate}
                state={stateFromMutation(seoMut)}
                loadingLabel="Génération…"
                successLabel="SEO généré"
                errorLabel="Échec"
                className="w-full"
              >
                <Wand2 className="w-4 h-4 mr-2 inline" /> Générer le SEO de la page
              </ActionButton>
            </Card>

            <Card className="p-4 space-y-3 text-sm">
              <div>
                <Label className="text-xs flex items-center justify-between">
                  <span>Titre ({seoTitle.length}/60)</span>
                  {seoTitle.length > 60 && <span className="text-destructive">trop long</span>}
                </Label>
                <Input
                  value={seoTitle}
                  maxLength={80}
                  onChange={(e) => { setSeoTitle(e.target.value); setSeoDirty(true); }}
                />
              </div>
              <div>
                <Label className="text-xs flex items-center justify-between">
                  <span>Meta description ({seoDescription.length}/160)</span>
                  {seoDescription.length > 160 && <span className="text-destructive">trop long</span>}
                </Label>
                <Textarea
                  rows={3}
                  value={seoDescription}
                  maxLength={200}
                  onChange={(e) => { setSeoDescription(e.target.value); setSeoDirty(true); }}
                />
              </div>
              <div>
                <Label className="text-xs">H1</Label>
                <Input
                  value={seoH1}
                  onChange={(e) => { setSeoH1(e.target.value); setSeoDirty(true); }}
                />
              </div>
              <div>
                <Label className="text-xs">Mots-clés (séparés par des virgules)</Label>
                <Textarea
                  rows={2}
                  value={seoKeywords}
                  onChange={(e) => { setSeoKeywords(e.target.value); setSeoDirty(true); }}
                  placeholder="boutique premium, mode éditoriale, ..."
                />
              </div>
              <div>
                <Label className="text-xs">
                  JSON-LD ({seoJsonld.length} bloc{seoJsonld.length > 1 ? "s" : ""})
                </Label>
                <pre className="text-[10px] bg-muted/50 rounded p-2 max-h-40 overflow-auto mt-1">
                  {seoJsonld.length === 0
                    ? "Aucun JSON-LD. Lancez le Copilot pour le générer."
                    : JSON.stringify(seoJsonld, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2 pt-1">
                <ActionButton
                  size="sm"
                  onClick={handleSeoSave}
                  state={stateFromMutation(seoSave)}
                  disabled={!seoDirty}
                  loadingLabel="Sauvegarde…"
                  successLabel="Sauvegardé"
                  errorLabel="Échec"
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  {seoDirty ? "Sauvegarder" : "Sauvegardé"}
                </ActionButton>
                <ActionButton
                  size="sm"
                  variant="outline"
                  onClick={handleSeoGenerate}
                  state={stateFromMutation(seoMut)}
                  loadingLabel="…"
                  successLabel="✓"
                  errorLabel="!"
                  title="Régénérer le JSON-LD à partir de l'ADN"
                >
                  <Wand2 className="w-4 h-4" />
                </ActionButton>
              </div>
            </Card>

            {/* Content Brief IA */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Content Brief IA</h3>
                </div>
                <ActionButton
                  size="sm"
                  variant="outline"
                  onClick={handleBriefGenerate}
                  state={stateFromMutation(briefMut)}
                  loadingLabel="…"
                  successLabel="✓"
                  errorLabel="!"
                >
                  <Wand2 className="w-3 h-3" />
                </ActionButton>
              </div>
              {!brief ? (
                <p className="text-xs text-muted-foreground">
                  Génère un brief actionnable (intent, H1, plan H2, questions à couvrir, longueur cible).
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <Label className="text-[10px] uppercase opacity-60">Requête cible</Label>
                    <p className="font-medium">{brief.target_query}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase opacity-60">Intent</Label>
                    <p>{brief.search_intent}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase opacity-60">H1 recommandé</Label>
                    <p className="italic">{brief.recommended_h1}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase opacity-60">Plan ({brief.outline.length} H2)</Label>
                    <ul className="list-disc pl-4 space-y-1 mt-1">
                      {brief.outline.map((o, i) => (
                        <li key={i}>
                          <span className="font-medium">{o.h2}</span>
                          <ul className="list-[circle] pl-4 opacity-70">
                            {o.talking_points.map((t, j) => <li key={j}>{t}</li>)}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase opacity-60">Questions à couvrir</Label>
                    <ul className="list-disc pl-4 mt-1">
                      {brief.questions_to_answer.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                  <p className="text-[10px] opacity-60">Longueur cible : ~{brief.target_word_count} mots</p>
                  <ActionButton
                    size="sm"
                    className="w-full mt-2"
                    onClick={applyBrief}
                    state={stateFromMutation(updateScene)}
                    loadingLabel="Application…"
                    successLabel="Brief appliqué"
                    errorLabel="Échec"
                  >
                    <Wand2 className="w-3.5 h-3.5 mr-2 inline" />
                    Appliquer le brief (H1, plan & questions)
                  </ActionButton>
                </div>
              )}
            </Card>

            {/* Keyword Clusters IA */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Clusters de mots-clés</h3>
                </div>
                <ActionButton
                  size="sm"
                  variant="outline"
                  onClick={handleClustersGenerate}
                  state={stateFromMutation(clustersMut)}
                  loadingLabel="…"
                  successLabel="✓"
                  errorLabel="!"
                >
                  <Wand2 className="w-3 h-3" />
                </ActionButton>
              </div>
              {clusters.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Structure tes mots-clés en piliers (pillar) + supports (longue traîne).
                </p>
              ) : (
                <div className="space-y-3">
                  {clusters.map((c, i) => (
                    <div key={i} className="rounded border border-border/40 p-2 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{c.theme}</span>
                        <Badge variant="outline" className="text-[10px]">{c.intent}</Badge>
                      </div>
                      <p className="text-primary font-medium">{c.pillar_keyword}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {[c.pillar_keyword, ...c.supporting_keywords].map((k) => {
                          const selected = seoKeywordsList.includes(k);
                          return (
                            <button
                              key={k}
                              type="button"
                              onClick={() => (selected ? removeKeyword(k) : addKeyword(k))}
                              className={`px-2 py-0.5 rounded-full text-[10px] transition border ${
                                selected
                                  ? "bg-primary/10 border-primary/40 text-primary"
                                  : "bg-muted border-transparent hover:bg-primary/10"
                              }`}
                              title={selected ? "Retirer des mots-clés SEO" : "Ajouter aux mots-clés SEO"}
                            >
                              {selected ? "✓" : "+"} {k}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {seoKeywordsList.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <Label className="text-[10px] uppercase opacity-60">
                    Mots-clés sélectionnés ({seoKeywordsList.length})
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {seoKeywordsList.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => removeKeyword(k)}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/30 hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition"
                        title="Cliquer pour retirer"
                      >
                        {k} ×
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
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

      {/* Delete confirmation */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={(o) => !o && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette scène ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le contenu de la scène sera définitivement perdu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pre-publish validation errors */}
      <AlertDialog open={showPublishErrors} onOpenChange={setShowPublishErrors}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Publication impossible
            </AlertDialogTitle>
            <AlertDialogDescription>
              Corrigez les éléments suivants avant de publier votre boutique :
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="text-sm space-y-2 list-disc pl-5 max-h-72 overflow-y-auto">
            {fullValidation.errors.map((e, i) => (
              <li key={i} className="text-foreground">{e}</li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPublishErrors(false)}>
              Compris
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ----------------------- Inspector ----------------------- */

function SceneInspector({
  scene,
  onPatch,
  onDelete,
  onRemix,
  isRemixing,
  remixState,
}: {
  scene: SceneRecord;
  onPatch: (patch: Partial<Pick<SceneRecord, "content" | "variant" | "is_visible">>) => void;
  onDelete: () => void;
  onRemix: () => void;
  isRemixing: boolean;
  remixState?: "idle" | "loading" | "success" | "error";
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
          <ActionButton
            variant="ghost"
            size="icon"
            onClick={onRemix}
            state={remixState ?? (isRemixing ? "loading" : "idle")}
            loadingLabel=""
            successLabel=""
            errorLabel=""
            title="Remix IA — réécrit le contenu de la scène"
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