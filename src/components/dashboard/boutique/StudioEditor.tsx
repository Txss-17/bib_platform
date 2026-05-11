import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  Copy,
  Smartphone,
  Tablet,
  Monitor,
  Link2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { HighlightsManager } from "./HighlightsManager";
import { ALL_FONTS, loadGoogleFont } from "@/lib/googleFonts";
import {
  useBoutiquePages,
  useCreateBoutiquePage,
  useUpdateBoutiquePage,
  useDeleteBoutiquePage,
  useReorderBoutiquePages,
} from "@/hooks/useBoutiquePages";
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
  useUpdateBrandDNA,
  useReshuffleStructure,
  useGenerateBrandDNA,
} from "@/hooks/useBrandStudio";
import {
  STUDIO_SCENES,
  STUDIO_BUNDLES,
  findSceneDefinition,
  type SceneRecord,
  type SceneRole,
} from "@/lib/studioScenes";
import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SceneInspectorPro } from "./SceneInspectorPro";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  PAGE_TEMPLATES,
  recommendedSceneTypesForPage,
  PRODUCT_PAGE_SLUG,
  PRODUCT_PAGE_SCENES,
  type PageTemplate,
} from "@/lib/pageTemplates";

/* ---------- Color helpers (HSL "h s% l%" <-> #rrggbb) ---------- */
function hslStringToHex(hsl?: string): string {
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

function hexToHslString(hex: string): string {
  const m = hex.trim().replace("#", "");
  if (m.length !== 6) return "0 0% 0%";
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
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

const STUDIO_PALETTE_PRESETS: Array<{
  name: string;
  palette: { primary: string; accent: string; surface: string; ink: string };
}> = [
  { name: "Marine BIB", palette: { primary: "215 55% 14%", accent: "41 55% 52%", surface: "40 30% 96%", ink: "220 20% 18%" } },
  { name: "Nature", palette: { primary: "152 45% 22%", accent: "38 60% 55%", surface: "45 35% 96%", ink: "150 15% 18%" } },
  { name: "Élégant", palette: { primary: "265 45% 25%", accent: "320 50% 60%", surface: "300 20% 97%", ink: "260 15% 20%" } },
  { name: "Chaleureux", palette: { primary: "20 70% 30%", accent: "35 85% 55%", surface: "30 40% 97%", ink: "20 20% 20%" } },
  { name: "Minimaliste", palette: { primary: "220 15% 20%", accent: "210 10% 50%", surface: "0 0% 98%", ink: "220 15% 18%" } },
  { name: "Rose", palette: { primary: "340 60% 30%", accent: "350 70% 60%", surface: "340 30% 97%", ink: "340 20% 22%" } },
];

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
  /** Active page in the editor — null = home (scenes with page_id IS NULL). */
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const { data: scenes = [], isLoading } = useBoutiqueScenes(boutiqueId, activePageId);
  const updateScene = useUpdateScene();
  const reorder = useReorderScenes();
  const addScene = useAddScene();
  const removeScene = useDeleteScene();
  const seoMut = useGenerateSeo();
  const seoSave = useSaveSeo();
  const briefMut = useGenerateContentBrief();
  const clustersMut = useGenerateKeywordClusters();
  const remixMut = useRemixScene();
  const updateBrandDna = useUpdateBrandDNA();
  const reshuffle = useReshuffleStructure();
  const regenIdentity = useGenerateBrandDNA();

  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [clusters, setClusters] = useState<KeywordCluster[]>([]);
  const SEO_MIN_SCORE = 60;

  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showPublishErrors, setShowPublishErrors] = useState(false);
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  /** Preview viewport simulator. */
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const { data: pages = [] } = useBoutiquePages(boutiqueId);
  const createPage = useCreateBoutiquePage();
  const updatePage = useUpdateBoutiquePage();
  const deletePage = useDeleteBoutiquePage();
  const reorderPages = useReorderBoutiquePages();
  const seededRef = useRef(false);

  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId) ?? null,
    [pages, activePageId],
  );

  /** Create a page from a template, then seed its scenes sequentially. */
  const handleCreatePageFromTemplate = async (tpl: PageTemplate) => {
    try {
      const page = await createPage.mutateAsync({
        boutiqueId,
        title: tpl.defaultTitle,
        mode: "rich",
      });
      // Patch SEO metadata on the page if the template provides defaults.
      if (tpl.seoTitle || tpl.seoDescription) {
        await updatePage.mutateAsync({
          pageId: page.id,
          boutiqueId,
          patch: {
            seo_title: tpl.seoTitle ?? null,
            seo_description: tpl.seoDescription ?? null,
          },
        });
      }
      // Seed scenes for this page.
      for (let i = 0; i < tpl.scenes.length; i++) {
        const s = tpl.scenes[i];
        const def = findSceneDefinition(s.sceneType);
        const baseContent = (def?.defaultContent ?? {}) as Record<string, unknown>;
        await addScene.mutateAsync({
          boutiqueId,
          sceneType: s.sceneType,
          position: i,
          variant: s.variant,
          content: { ...baseContent, ...(s.contentPatch ?? {}) },
          pageId: page.id,
        });
      }
      setActivePageId(page.id);
      toast.success(`Page « ${tpl.defaultTitle} » créée${tpl.scenes.length > 0 ? ` avec ${tpl.scenes.length} scène${tpl.scenes.length > 1 ? "s" : ""}` : ""}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Création impossible");
    }
  };

  /**
   * Auto-seed standard pages (Boutique, À propos, Contact) the first time the
   * editor opens for a boutique that has none, so the user has something to
   * edit instead of a blank slate. The home page lives in `boutique_scenes`
   * with `page_id IS NULL` and isn't created here.
   */
  useEffect(() => {
    if (!boutiqueId || seededRef.current || pages.length > 0) return;
    seededRef.current = true;
    (async () => {
      for (const key of ["products", "about", "contact"] as const) {
        const tpl = PAGE_TEMPLATES.find((t) => t.key === key);
        if (tpl) {
          try {
            await handleCreatePageFromTemplate(tpl);
          } catch {
            /* don't block remaining seeds on a single failure */
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boutiqueId, pages.length]);

  /**
   * Open (or create on first call) the reserved Product Page template.
   * This page is hidden from the public nav (slug = "__product__") and serves
   * as the layout used by every product detail page on the storefront.
   */
  const handleOpenProductPageTemplate = async () => {
    const existing = pages.find((p) => p.slug === PRODUCT_PAGE_SLUG);
    if (existing) {
      setActivePageId(existing.id);
      toast.success("Modèle de page produit ouvert");
      return;
    }
    try {
      const page = await createPage.mutateAsync({
        boutiqueId,
        title: "Modèle fiche produit",
        mode: "rich",
        slug: PRODUCT_PAGE_SLUG,
        showInNav: false,
      });
      for (let i = 0; i < PRODUCT_PAGE_SCENES.length; i++) {
        const s = PRODUCT_PAGE_SCENES[i];
        const def = findSceneDefinition(s.sceneType);
        const baseContent = (def?.defaultContent ?? {}) as Record<string, unknown>;
        await addScene.mutateAsync({
          boutiqueId,
          sceneType: s.sceneType,
          position: i,
          variant: s.variant,
          content: { ...baseContent, ...(s.contentPatch ?? {}) },
          pageId: page.id,
        });
      }
      setActivePageId(page.id);
      toast.success("Modèle de page produit initialisé");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ouverture impossible");
    }
  };

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = scenes.findIndex((s) => s.id === active.id);
    const newIdx = scenes.findIndex((s) => s.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(scenes, oldIdx, newIdx);
    reorder.mutate(
      { boutiqueId, orderedIds: next.map((s) => s.id) },
      { onError: () => toast.error("Réorganisation impossible, réessayez.") },
    );
  };

  const handleDuplicate = (s: SceneRecord) => {
    if (addScene.isPending) return;
    addScene.mutate(
      {
        boutiqueId,
        sceneType: s.scene_type,
        position: scenes.length,
        variant: s.variant,
        content: s.content,
        pageId: activePageId,
      },
      {
        onSuccess: () => toast.success("Scène dupliquée"),
        onError: () => toast.error("Duplication impossible"),
      },
    );
  };

  const handleAdd = (sceneType: string) => {
    if (addScene.isPending) return;
    addScene.mutate(
      { boutiqueId, sceneType, position: scenes.length, pageId: activePageId },
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
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 lg:h-[calc(100vh-72px)]">
      {/* ---------------- Left rail ---------------- */}
      <aside className="border-r border-border/60 bg-muted/30 flex flex-col lg:h-full max-h-[80vh] lg:max-h-none overflow-hidden">
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
          <TabsList className="mx-4 mt-3 grid grid-cols-4">
            <TabsTrigger value="scenes">Scènes</TabsTrigger>
            <TabsTrigger value="brand">Identité</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="highlights">Marketplace</TabsTrigger>
          </TabsList>

          {/* SCENES TAB */}
          <TabsContent value="scenes" className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 mt-3">
            {/* Reshuffle structure */}
            <Card className="p-2.5 mb-2 flex items-center justify-between gap-2 bg-muted/30">
              <div className="text-xs">
                <p className="font-medium">Structure de la page</p>
                <p className="opacity-60">Change le template global ou tente une nouvelle disposition.</p>
              </div>
              <div className="flex gap-1">
                {STUDIO_BUNDLES.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => {
                      reshuffle.mutate(
                        { boutiqueId, bundleKey: b.key },
                        {
                          onSuccess: () => toast.success(`Structure « ${b.name} » appliquée`),
                          onError: () => toast.error("Réorganisation impossible"),
                        },
                      );
                    }}
                    title={b.name}
                    className="text-[10px] px-2 py-1 rounded border border-border hover:border-primary transition"
                  >
                    {b.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </Card>

            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin opacity-50" />
              </div>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={scenes.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {scenes.map((s) => (
                  <SortableSceneRow
                    key={s.id}
                    scene={s}
                    isActive={activeScene?.id === s.id}
                    onSelect={() => setActiveSceneId(s.id)}
                    onToggleVisible={() =>
                      updateScene.mutate({
                        sceneId: s.id,
                        boutiqueId,
                        patch: { is_visible: !s.is_visible },
                      })
                    }
                    onDuplicate={() => handleDuplicate(s)}
                    onDelete={() => setPendingDeleteId(s.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {scenes.length > 0 && (
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                Glisse les scènes pour les réorganiser. Sections illimitées.
              </p>
            )}

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
                {(() => {
                  const recs = recommendedSceneTypesForPage(
                    activePage?.title ?? (activePageId === null ? "accueil" : null),
                    activePage?.slug,
                  );
                  const recSet = new Set(recs);
                  const recommended = recs
                    .map((id) => STUDIO_SCENES.find((s) => s.id === id))
                    .filter((d): d is (typeof STUDIO_SCENES)[number] => Boolean(d));
                  const others = STUDIO_SCENES.filter((d) => !recSet.has(d.id));
                  const renderRow = (d: (typeof STUDIO_SCENES)[number]) => (
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
                  );
                  return (
                    <>
                      {recommended.length > 0 && (
                        <>
                          <p className="text-[10px] uppercase tracking-wide text-primary/80 pt-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Recommandées pour cette page
                          </p>
                          {recommended.map(renderRow)}
                          <div className="h-px bg-border/40 my-2" />
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Toutes les scènes
                          </p>
                        </>
                      )}
                      {others.map(renderRow)}
                    </>
                  );
                })()}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAdd(false)}>
                  Annuler
                </Button>
              </Card>
            )}

            {activeScene && (
              <SceneInspectorPro
                key={activeScene.id}
                scene={activeScene}
                boutiqueId={boutiqueId}
                products={products}
                onPatch={(patch) =>
                  updateScene.mutate({
                    sceneId: activeScene.id,
                    boutiqueId,
                    patch,
                  })
                }
                onDelete={() => setPendingDeleteId(activeScene.id)}
                onRemix={() => handleRemix(activeScene)}
                remixState={stateFromMutation(remixMut)}
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
                <Card className="p-3 flex items-center justify-between gap-2 bg-muted/30">
                  <div className="text-xs">
                    <p className="font-medium">Régénérer l'identité</p>
                    <p className="opacity-60">Crée une nouvelle palette + copy à partir de tes réponses initiales.</p>
                  </div>
                  <ActionButton
                    size="sm"
                    variant="outline"
                    state={stateFromMutation(regenIdentity)}
                    loadingLabel="…"
                    successLabel="✓"
                    errorLabel="!"
                    onClick={() => {
                      const answers = (brandDna.studio_answers ?? {}) as any;
                      if (!answers.audience) {
                        toast.error("Réponds d'abord au Brand Studio.");
                        return;
                      }
                      regenIdentity.mutate(
                        { boutiqueId, answers },
                        {
                          onSuccess: () => toast.success("Identité régénérée"),
                          onError: (e) =>
                            toast.error(e instanceof Error ? e.message : "Échec"),
                        },
                      );
                    }}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </ActionButton>
                </Card>

                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Tagline</Label>
                  <Input
                    value={brandDna.generated_copy?.tagline ?? ""}
                    onChange={(e) =>
                      updateBrandDna.mutate({
                        boutiqueId,
                        patch: {
                          generated_copy: {
                            ...brandDna.generated_copy,
                            tagline: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Ambiance</Label>
                  <Input
                    value={brandDna.ambiance ?? ""}
                    onChange={(e) =>
                      updateBrandDna.mutate({ boutiqueId, patch: { ambiance: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Ton</Label>
                  <Input
                    value={brandDna.tone ?? ""}
                    onChange={(e) =>
                      updateBrandDna.mutate({ boutiqueId, patch: { tone: e.target.value } })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs uppercase tracking-wide opacity-60">Police titres</Label>
                    <Select
                      value={brandDna.generated_typography?.display ?? ""}
                      onValueChange={(v) => {
                        loadGoogleFont(v);
                        updateBrandDna.mutate({
                          boutiqueId,
                          patch: {
                            generated_typography: {
                              ...brandDna.generated_typography,
                              display: v,
                            },
                          },
                        });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {ALL_FONTS.map((f) => (
                          <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wide opacity-60">Police corps</Label>
                    <Select
                      value={brandDna.generated_typography?.body ?? ""}
                      onValueChange={(v) => {
                        loadGoogleFont(v);
                        updateBrandDna.mutate({
                          boutiqueId,
                          patch: {
                            generated_typography: {
                              ...brandDna.generated_typography,
                              body: v,
                            },
                          },
                        });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {ALL_FONTS.map((f) => (
                          <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Hero — Titre</Label>
                  <Input
                    value={brandDna.generated_copy?.hero_title ?? ""}
                    onChange={(e) =>
                      updateBrandDna.mutate({
                        boutiqueId,
                        patch: {
                          generated_copy: {
                            ...brandDna.generated_copy,
                            hero_title: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Hero — Sous-titre</Label>
                  <Textarea
                    rows={2}
                    value={brandDna.generated_copy?.hero_subtitle ?? ""}
                    onChange={(e) =>
                      updateBrandDna.mutate({
                        boutiqueId,
                        patch: {
                          generated_copy: {
                            ...brandDna.generated_copy,
                            hero_subtitle: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wide opacity-60">Palette</Label>
                  <p className="text-[11px] opacity-60 mb-2">
                    Cliquez sur une pastille pour modifier la couleur. L'aperçu se met à jour en direct.
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {(["primary", "accent", "surface", "ink"] as const).map((k) => {
                      const v = (brandDna.generated_palette as Record<string, string | undefined>)[k];
                      const hex = hslStringToHex(v);
                      return (
                        <label key={k} className="flex flex-col items-center gap-1 cursor-pointer">
                          <span
                            className="relative h-10 w-full rounded border border-border overflow-hidden"
                            style={{ background: v ? `hsl(${v})` : "transparent" }}
                          >
                            <input
                              type="color"
                              value={hex}
                              onChange={(e) => {
                                const nextHsl = hexToHslString(e.target.value);
                                updateBrandDna.mutate({
                                  boutiqueId,
                                  patch: {
                                    generated_palette: {
                                      ...brandDna.generated_palette,
                                      [k]: nextHsl,
                                    },
                                  },
                                });
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              aria-label={`Couleur ${k}`}
                            />
                          </span>
                          <span className="text-[10px] opacity-60 capitalize">{k}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-3">
                    <p className="text-[11px] opacity-60 mb-1">Palettes prêtes à l'emploi</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STUDIO_PALETTE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            updateBrandDna.mutate({
                              boutiqueId,
                              patch: { generated_palette: preset.palette },
                            })
                          }
                          className="flex items-center gap-1 px-2 py-1 rounded-md border border-border hover:border-bib-gold transition-colors text-[10px]"
                          title={preset.name}
                        >
                          {(["primary", "accent", "surface", "ink"] as const).map((k) => (
                            <span
                              key={k}
                              className="h-3 w-3 rounded-sm border border-black/10"
                              style={{ background: `hsl(${preset.palette[k]})` }}
                            />
                          ))}
                          <span className="ml-1">{preset.name}</span>
                        </button>
                      ))}
                    </div>
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

          {/* MARKETPLACE HIGHLIGHTS TAB */}
          <TabsContent value="highlights" className="flex-1 overflow-y-auto px-4 pb-6 mt-3">
            <HighlightsManager boutiqueId={boutiqueId} />
          </TabsContent>
        </Tabs>
      </aside>

      {/* ---------------- Live preview ---------------- */}
      <div className="lg:overflow-y-auto bg-background min-h-[60vh]">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/40">
          {/* Page tabs strip */}
          <div className="flex items-center gap-1 px-3 pt-2 pb-1 overflow-x-auto">
            {/* Home tab (always present, not deletable, not renameable) */}
            <button
              type="button"
              onClick={() => setActivePageId(null)}
              className={`shrink-0 px-3 py-1.5 rounded-t-md text-xs font-medium border-b-2 transition-colors ${
                activePageId === null
                  ? "border-primary text-foreground bg-muted/50"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Accueil
            </button>
            {pages.filter((p) => p.slug !== PRODUCT_PAGE_SLUG).map((p, idx) => {
              const active = activePageId === p.id;
              const isRenaming = renamingPageId === p.id;
              return (
                <div
                  key={p.id}
                  className={`shrink-0 group flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-t-md border-b-2 transition-colors ${
                    active
                      ? "border-primary bg-muted/50"
                      : "border-transparent hover:bg-muted/30"
                  }`}
                >
                  {isRenaming ? (
                    <Input
                      autoFocus
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onBlur={() => {
                        const t = renameDraft.trim();
                        if (t && t !== p.title) {
                          updatePage.mutate({ pageId: p.id, boutiqueId, patch: { title: t } });
                        }
                        setRenamingPageId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") setRenamingPageId(null);
                      }}
                      className="h-6 text-xs w-32"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActivePageId(p.id)}
                      onDoubleClick={() => {
                        setRenamingPageId(p.id);
                        setRenameDraft(p.title);
                      }}
                      className={`text-xs font-medium px-1 ${active ? "text-foreground" : "text-muted-foreground"}`}
                      title="Double-clic pour renommer"
                    >
                      {p.title}
                    </button>
                  )}
                  {active && (
                    <>
                      <button
                        type="button"
                        disabled={idx === 0 || reorderPages.isPending}
                        onClick={() => {
                          const ids = pages.map((x) => x.id);
                          [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
                          reorderPages.mutate({ boutiqueId, orderedIds: ids });
                        }}
                        className="opacity-60 hover:opacity-100 disabled:opacity-20 p-0.5"
                        title="Déplacer à gauche"
                      >
                        <ChevronUp className="w-3 h-3 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === pages.length - 1 || reorderPages.isPending}
                        onClick={() => {
                          const ids = pages.map((x) => x.id);
                          [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
                          reorderPages.mutate({ boutiqueId, orderedIds: ids });
                        }}
                        className="opacity-60 hover:opacity-100 disabled:opacity-20 p-0.5"
                        title="Déplacer à droite"
                      >
                        <ChevronDown className="w-3 h-3 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`Supprimer la page "${p.title}" et toutes ses scènes ?`)) return;
                          deletePage.mutate(
                            { pageId: p.id, boutiqueId },
                            {
                              onSuccess: () => {
                                toast.success("Page supprimée");
                                setActivePageId(null);
                              },
                              onError: () => toast.error("Suppression impossible"),
                            },
                          );
                        }}
                        className="opacity-60 hover:opacity-100 hover:text-destructive p-0.5"
                        title="Supprimer la page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={createPage.isPending || addScene.isPending}
                  className="shrink-0 h-7 px-2 text-xs"
                  title="Ajouter une page"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Page
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wide opacity-60">
                  Créer une page
                </DropdownMenuLabel>
                {PAGE_TEMPLATES.map((tpl, i) => (
                  <div key={tpl.key}>
                    {i === 1 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => handleCreatePageFromTemplate(tpl)}
                      className="flex items-start gap-2 cursor-pointer"
                    >
                      <span className="text-base leading-none mt-0.5">{tpl.emoji}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium">{tpl.label}</span>
                        <span className="block text-[11px] text-muted-foreground truncate">
                          {tpl.description}
                        </span>
                      </span>
                    </DropdownMenuItem>
                  </div>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wide opacity-60">
                  Modèle global
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={handleOpenProductPageTemplate}
                  className="flex items-start gap-2 cursor-pointer"
                >
                  <span className="text-base leading-none mt-0.5">📦</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">
                      {pages.some((p) => p.slug === PRODUCT_PAGE_SLUG)
                        ? "Éditer le modèle de fiche produit"
                        : "Créer le modèle de fiche produit"}
                    </span>
                    <span className="block text-[11px] text-muted-foreground truncate">
                      Utilisé pour toutes les pages produit du storefront
                    </span>
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between px-4 py-1.5 border-t border-border/30">
            <span className="text-xs uppercase tracking-wide opacity-60">
              Aperçu : {activePageId === null ? "Accueil" : pages.find((p) => p.id === activePageId)?.title ?? "Page"}
              {scenes.length === 0 && !isLoading ? " (aucune scène)" : ""}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border border-border/50 overflow-hidden">
                {([
                  { k: "mobile", icon: Smartphone, label: "Mobile (375)" },
                  { k: "tablet", icon: Tablet, label: "Tablette (768)" },
                  { k: "desktop", icon: Monitor, label: "Desktop (1280)" },
                ] as const).map(({ k, icon: Icon, label }) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPreviewDevice(k)}
                    title={label}
                    aria-label={label}
                    className={`p-1.5 transition ${
                      previewDevice === k
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <span className="text-xs opacity-50">{scenes.length} scène{scenes.length > 1 ? "s" : ""}</span>
            </div>
          </div>
          {activePage && (
            <PageMetadataPanel
              page={activePage}
              boutiqueSlug={publicSlug}
              onPatch={(patch) =>
                updatePage.mutate({ pageId: activePage.id, boutiqueId, patch })
              }
            />
          )}
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Chargement de l'aperçu…</div>
        ) : scenes.filter((s) => s.is_visible).length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Aucune scène visible. Ajoute une scène depuis le panneau de gauche pour voir l'aperçu.
          </div>
        ) : (
        <PreviewViewportFrame device={previewDevice}>
          <StudioSceneRenderer
            scenes={scenes}
            brandDna={brandDna ?? null}
            boutiqueName={boutiqueName}
            products={products}
          />
        </PreviewViewportFrame>
        )}
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

/* ---------- Sortable scene row (drag & drop, illimité) ---------- */
function SortableSceneRow({
  scene,
  isActive,
  onSelect,
  onToggleVisible,
  onDuplicate,
  onDelete,
}: {
  scene: SceneRecord;
  isActive: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: scene.id });
  const def = findSceneDefinition(scene.scene_type);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group cursor-pointer rounded-lg border p-3 flex items-start gap-2 transition ${
        isActive
          ? "border-primary bg-primary/5"
          : "border-border/50 hover:border-border bg-card"
      } ${isDragging ? "shadow-lg" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="touch-none cursor-grab active:cursor-grabbing p-0.5 -ml-0.5 mt-0.5 opacity-40 hover:opacity-100"
        aria-label="Réorganiser"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {def?.name ?? scene.scene_type}
          </span>
          <Badge variant="outline" className="text-[10px] capitalize">
            {scene.role}
          </Badge>
          {!scene.is_visible && (
            <Badge variant="secondary" className="text-[10px]">Masqué</Badge>
          )}
          {scene.style_overrides && (
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Style</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{def?.tagline}</p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
        <Switch
          checked={scene.is_visible}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={onToggleVisible}
          aria-label="Afficher/Masquer"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 hover:bg-muted rounded"
          title="Dupliquer"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-destructive/10 text-destructive rounded"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Page metadata (slug + SEO) inline panel ---------- */
function slugifyClient(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function PageMetadataPanel({
  page,
  boutiqueSlug,
  onPatch,
}: {
  page: {
    id: string;
    title: string;
    slug: string;
    seo_title: string | null;
    seo_description: string | null;
    mode: "simple" | "rich";
    show_in_nav: boolean;
    is_visible: boolean;
    hero_image_url: string | null;
    content: string | null;
  };
  boutiqueSlug?: string;
  onPatch: (
    patch: Partial<{
      title: string;
      slug: string;
      seo_title: string | null;
      seo_description: string | null;
      mode: "simple" | "rich";
      show_in_nav: boolean;
      is_visible: boolean;
      hero_image_url: string | null;
      content: string | null;
    }>,
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState(page.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(page.seo_description ?? "");
  const [hero, setHero] = useState(page.hero_image_url ?? "");
  const [content, setContent] = useState(page.content ?? "");

  // Re-sync if active page changes externally.
  useEffect(() => {
    setTitle(page.title);
    setSlug(page.slug);
    setSeoTitle(page.seo_title ?? "");
    setSeoDesc(page.seo_description ?? "");
    setHero(page.hero_image_url ?? "");
    setContent(page.content ?? "");
  }, [
    page.id,
    page.title,
    page.slug,
    page.seo_title,
    page.seo_description,
    page.hero_image_url,
    page.content,
  ]);

  const publicUrl =
    boutiqueSlug && typeof window !== "undefined"
      ? `${window.location.origin}/boutique/${boutiqueSlug}/p/${slug}`
      : `/boutique/${boutiqueSlug ?? "…"}/p/${slug}`;

  return (
    <div className="border-t border-border/30 bg-muted/20 px-4 py-2">
      {/* Always-visible mode toggle + visibility row — drives the preview immediately. */}
      <div className="flex flex-wrap items-center gap-3 pb-2">
        <div className="flex items-center rounded-md border border-border/50 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => page.mode !== "rich" && onPatch({ mode: "rich" })}
            className={`px-2.5 py-1 transition ${
              page.mode === "rich"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Mode scènes : composez la page avec des blocs visuels."
          >
            Rich (scènes)
          </button>
          <button
            type="button"
            onClick={() => page.mode !== "simple" && onPatch({ mode: "simple" })}
            className={`px-2.5 py-1 transition border-l border-border/50 ${
              page.mode === "simple"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Mode simple : un titre, une image et du markdown."
          >
            Simple (markdown)
          </button>
        </div>
        <label className="flex items-center gap-1.5 text-xs">
          <Switch
            checked={page.show_in_nav}
            onCheckedChange={(v) => onPatch({ show_in_nav: v })}
          />
          <span className="opacity-70">Afficher dans le menu</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs">
          <Switch
            checked={page.is_visible}
            onCheckedChange={(v) => onPatch({ is_visible: v })}
          />
          <span className="opacity-70">Page publique</span>
        </label>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs uppercase tracking-wide opacity-70 hover:opacity-100"
      >
        <span className="flex items-center gap-1.5">
          <Link2 className="w-3 h-3" /> Métadonnées de la page
        </span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
          <div>
            <Label className="text-[10px]">Titre de la page</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                const t = title.trim();
                if (t && t !== page.title) onPatch({ title: t });
              }}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] flex items-center justify-between">
              <span>Slug (URL)</span>
              <button
                type="button"
                onClick={() => {
                  const auto = slugifyClient(title);
                  setSlug(auto);
                  if (auto && auto !== page.slug) onPatch({ slug: auto });
                }}
                className="text-[10px] text-primary hover:underline"
              >
                Auto
              </button>
            </Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(slugifyClient(e.target.value))}
              onBlur={() => {
                const s = slug.trim();
                if (s && s !== page.slug) onPatch({ slug: s });
              }}
              className="h-8 text-xs font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-[10px]">Lien public</Label>
            <div className="flex items-center gap-1">
              <Input
                value={publicUrl}
                readOnly
                className="h-8 text-xs font-mono opacity-70"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-2"
                onClick={() => {
                  navigator.clipboard?.writeText(publicUrl);
                  toast.success("Lien copié");
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-[10px] flex items-center justify-between">
              <span>Titre SEO ({seoTitle.length}/60)</span>
              {seoTitle.length > 60 && <span className="text-destructive">trop long</span>}
            </Label>
            <Input
              value={seoTitle}
              maxLength={80}
              onChange={(e) => setSeoTitle(e.target.value)}
              onBlur={() => {
                if ((seoTitle || null) !== page.seo_title) onPatch({ seo_title: seoTitle || null });
              }}
              className="h-8 text-xs"
              placeholder="Titre dans les résultats Google"
            />
          </div>
          <div>
            <Label className="text-[10px] flex items-center justify-between">
              <span>Meta description ({seoDesc.length}/160)</span>
              {seoDesc.length > 160 && <span className="text-destructive">trop long</span>}
            </Label>
            <Textarea
              value={seoDesc}
              maxLength={200}
              onChange={(e) => setSeoDesc(e.target.value)}
              onBlur={() => {
                if ((seoDesc || null) !== page.seo_description)
                  onPatch({ seo_description: seoDesc || null });
              }}
              rows={2}
              className="text-xs"
              placeholder="Description affichée dans les résultats de recherche"
            />
          </div>
          {page.mode === "simple" && (
            <>
              <div className="md:col-span-2">
                <Label className="text-[10px]">Image héro (URL)</Label>
                <Input
                  value={hero}
                  onChange={(e) => setHero(e.target.value)}
                  onBlur={() => {
                    if ((hero || null) !== page.hero_image_url)
                      onPatch({ hero_image_url: hero || null });
                  }}
                  className="h-8 text-xs"
                  placeholder="https://…"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-[10px]">
                  Contenu (markdown) — # Titre, **gras**, *italique*, [lien](url)
                </Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={() => {
                    if ((content || null) !== page.content)
                      onPatch({ content: content || null });
                  }}
                  rows={8}
                  className="text-xs font-mono"
                  placeholder={"# À propos\n\nNotre histoire commence…"}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Preview viewport frame (mobile / tablet / desktop) ---------- */
function PreviewViewportFrame({
  device,
  children,
}: {
  device: "desktop" | "tablet" | "mobile";
  children: ReactNode;
}) {
  if (device === "desktop") {
    return <>{children}</>;
  }
  const widthMap = { mobile: 375, tablet: 768 } as const;
  const w = widthMap[device];
  return (
    <div className="flex justify-center bg-muted/30 py-4 px-2">
      <div
        className="bg-background border border-border/60 rounded-2xl shadow-xl overflow-hidden"
        style={{ width: w, maxWidth: "100%" }}
      >
        {children}
      </div>
    </div>
  );
}