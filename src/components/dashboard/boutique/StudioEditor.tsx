import { translateUi } from "@/lib/uiTranslation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  EyeOff,
  GripVertical,
  Loader2,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Wand2,
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

import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

import { ActionButton, stateFromMutation } from "./ActionButton";
import { SceneInspectorPro } from "./SceneInspectorPro";
import { StoriesManager } from "./StoriesManager";

import {
  useBoutiquePages,
  useCreateBoutiquePage,
  useUpdateBoutiquePage,
  useDeleteBoutiquePage,
  useReorderBoutiquePages,
  useGeneratePageSeo,
} from "@/hooks/useBoutiquePages";

import {
  useBoutiqueScenes,
  useBrandDNA,
  useStudioAnswers,
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
  useUpdateBrandDNA,
  useReshuffleStructure,
  useGenerateBrandDNA,
  type ContentBrief,
  type KeywordCluster,
  type SceneRecord,
  type BrandDNA,
} from "@/hooks/useBrandStudio";

import {
  STUDIO_SCENES,
  STUDIO_BUNDLES,
  findSceneDefinition,
  type SceneRole,
} from "@/lib/studioScenes";

import {
  PAGE_TEMPLATES,
  PRODUCT_PAGE_SLUG,
  PRODUCT_PAGE_SCENES,
  recommendedSceneTypesForPage,
  type PageTemplate,
} from "@/lib/pageTemplates";

import { ALL_FONTS, loadGoogleFont } from "@/lib/googleFonts";

import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";
import { supabase } from "@/integrations/supabase/client";
import { validateMarkdownLinks } from "@/lib/safeMarkdown";
import { ImageField } from "./SceneInspectorPro";
import {
  fetchBoutiquePublicationData,
  useBoutiquePublication,
} from "@/hooks/useBoutiquePublication";
import {
  validateBoutiquePublication,
  type PublicationScene,
} from "@/lib/boutiquePublication";

interface Props {
  boutiqueId: string;
  boutiqueName: string;
  category: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image_url?: string | null;
  }>;
  publicSlug?: string;
  isPublished: boolean;
  initialSeo?: {
    title?: string | null;
    description?: string | null;
    activeLocales?: string[] | null;
    defaultLocale?: string | null;
    publicOrigin?: string | null;
    jsonld?: {
      blocks?: Array<Record<string, unknown>>;
      keywords?: string[];
      h1?: string | null;
    } | null;
  };
}

const normalizeStudioPageTitle = (title: string) =>
  title
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");

const SUPPORTED_SEO_LOCALES = [
  {
    code: "fr",
    get label() {
      return translateUi("Français");
    },
  },
  {
    code: "en",
    get label() {
      return translateUi("Anglais");
    },
  },
  {
    code: "es",
    get label() {
      return translateUi("Espagnol");
    },
  },
  {
    code: "de",
    get label() {
      return translateUi("Allemand");
    },
  },
  {
    code: "it",
    get label() {
      return translateUi("Italien");
    },
  },
] as const;

interface PageLike {
  id: string;
  boutique_id: string;
  slug: string;
  title: string;
  mode: "simple" | "rich";
  hero_image_url: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  position: number;
  is_visible: boolean;
  show_in_nav: boolean;
}

interface SceneRowProps {
  scene: SceneRecord;
  active: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function hslToHex(hsl?: string | null): string {
  if (!hsl) {
    return "#000000";
  }

  const match = hsl
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/);

  if (!match) {
    return "#000000";
  }

  const h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;

  const a = s * Math.min(l, 1 - l);

  const channel = (n: number) => {
    const k = (n + h * 12) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));

    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

function hexToHsl(hex: string): string {
  const value = hex.trim().replace("#", "");

  if (value.length !== 6) {
    return "0 0% 0%";
  }

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;

      case g:
        h = (b - r) / d + 2;
        break;

      default:
        h = (r - g) / d + 4;
        break;
    }

    h *= 60;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const PALETTE_PRESETS = [
  {
    name: "Marine BIB",
    palette: {
      primary: "215 55% 14%",
      accent: "41 55% 52%",
      surface: "40 30% 96%",
      ink: "220 20% 18%",
    },
  },
  {
    name: "Nature",
    palette: {
      primary: "152 45% 22%",
      accent: "38 60% 55%",
      surface: "45 35% 96%",
      ink: "150 15% 18%",
    },
  },
  {
    name: "Élégant",
    palette: {
      primary: "265 45% 25%",
      accent: "320 50% 60%",
      surface: "300 20% 97%",
      ink: "260 15% 20%",
    },
  },
  {
    name: "Chaleureux",
    palette: {
      primary: "20 70% 30%",
      accent: "35 85% 55%",
      surface: "30 40% 97%",
      ink: "20 20% 20%",
    },
  },
  {
    name: "Minimaliste",
    palette: {
      primary: "220 15% 20%",
      accent: "210 10% 50%",
      surface: "0 0% 98%",
      ink: "220 15% 18%",
    },
  },
];

function PreviewFrame({
  device,
  children,
}: {
  device: "desktop" | "tablet" | "mobile";
  children: ReactNode;
}) {
  useLanguage();
  return <DevicePreviewFrame device={device}>{children}</DevicePreviewFrame>;
}

function DevicePreviewFrame({
  device,
  children,
}: {
  device: "desktop" | "tablet" | "mobile";
  children: ReactNode;
}) {
  useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [previewBody, setPreviewBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!previewBody) return;
    const sync = () => {
      const frameRoot = previewBody.ownerDocument.documentElement;
      frameRoot.className = document.documentElement.className;
      frameRoot.style.colorScheme = document.documentElement.style.colorScheme;
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => observer.disconnect();
  }, [previewBody]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const viewportWidth =
    device === "mobile" ? 375 : device === "tablet" ? 768 : 1280;
  const viewportHeight = device === "mobile" ? 780 : 900;
  const scale =
    containerWidth > 0 ? Math.min(1, containerWidth / viewportWidth) : 1;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-muted/30 p-2 sm:p-4"
    >
      <div
        className="mx-auto"
        style={{ width: viewportWidth * scale, height: viewportHeight * scale }}
      >
        <iframe
          title={translateUi("{v0} storefront preview", { v0: device })}
          srcDoc="<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>"
          onLoad={(event) => {
            const frameDocument = event.currentTarget.contentDocument;
            if (!frameDocument) return;

            const charset = frameDocument.createElement("meta");
            charset.setAttribute("charset", "utf-8");
            const viewport = frameDocument.createElement("meta");
            viewport.name = "viewport";
            viewport.content = "width=device-width, initial-scale=1";
            const base = frameDocument.createElement("base");
            base.href = `${window.location.origin}/`;
            const appStyles = Array.from(
              document.head.querySelectorAll('style, link[rel="stylesheet"]'),
            ).map((node) => node.cloneNode(true));

            frameDocument.head.replaceChildren(
              charset,
              viewport,
              base,
              ...appStyles,
            );
            frameDocument.documentElement.className =
              document.documentElement.className;
            frameDocument.body.className = document.body.className;
            frameDocument.documentElement.style.margin = "0";
            frameDocument.body.style.margin = "0";
            frameDocument.body.style.width = "100%";
            frameDocument.body.style.minWidth = "0";
            setPreviewBody(frameDocument.body);
          }}
          className="block origin-top-left border-0 bg-background"
          style={{
            width: viewportWidth,
            height: viewportHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
        {previewBody && createPortal(children, previewBody)}
      </div>
    </div>
  );
}
function SortableSceneRow({
  scene,
  active,
  onSelect,
  onToggle,
  onDuplicate,
  onDelete,
}: SceneRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: scene.id,
  });

  const definition = findSceneDefinition(scene.scene_type);

  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
      className={[
        "group flex cursor-pointer items-start gap-2 rounded-xl border p-3 transition",
        active
          ? "border-primary bg-primary/5"
          : "border-border/50 bg-card hover:border-border",
      ].join(" ")}
      onClick={onSelect}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-1 opacity-40 hover:bg-muted hover:opacity-100 active:cursor-grabbing"
        aria-label={english ? "Reorder scene" : "Réorganiser la scène"}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {definition?.name ?? scene.scene_type}
          </span>

          <Badge variant="outline" className="text-[10px]">
            {scene.role}
          </Badge>

          {!scene.is_visible && (
            <Badge variant="secondary" className="text-[10px]">
              {translateUi("Masquée")}
            </Badge>
          )}
        </div>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {definition?.tagline}
        </p>
      </div>

      <div
        className="flex items-center gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        <Switch
          checked={scene.is_visible}
          onCheckedChange={onToggle}
          aria-label={english ? "Show or hide" : "Afficher ou masquer"}
        />

        <button
          type="button"
          className="rounded p-1 hover:bg-muted"
          onClick={onDuplicate}
          title={english ? "Duplicate" : "Dupliquer"}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          className="rounded p-1 text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          title={english ? "Delete" : "Supprimer"}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function PageMetadata({
  page,
  boutiqueId,
  boutiqueSlug,
  onPatch,
}: {
  page: PageLike;
  boutiqueId: string;
  boutiqueSlug?: string;
  onPatch: (patch: Partial<PageLike>) => void;
}) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState(page.title);

  const [slug, setSlug] = useState(page.slug);

  const [seoTitle, setSeoTitle] = useState(page.seo_title ?? "");

  const [seoDescription, setSeoDescription] = useState(
    page.seo_description ?? "",
  );

  const [content, setContent] = useState(page.content ?? "");

  const generateSeo = useGeneratePageSeo();

  useEffect(() => {
    setTitle(page.title);
    setSlug(page.slug);
    setSeoTitle(page.seo_title ?? "");
    setSeoDescription(page.seo_description ?? "");
    setContent(page.content ?? "");
  }, [
    page.id,
    page.title,
    page.slug,
    page.seo_title,
    page.seo_description,
    page.content,
  ]);

  const linkErrors = useMemo(() => validateMarkdownLinks(content), [content]);

  const publicUrl = boutiqueSlug
    ? `${window.location.origin}/boutique/${boutiqueSlug}/p/${slug}`
    : `/boutique/…/p/${slug}`;

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);

  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);

  return (
    <div className="border-t bg-muted/20 px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs">
          <Switch
            checked={page.show_in_nav}
            onCheckedChange={(value) =>
              onPatch({
                show_in_nav: value,
              })
            }
          />
          Menu
        </label>

        <label className="flex items-center gap-2 text-xs">
          <Switch
            checked={page.is_visible}
            onCheckedChange={(value) =>
              onPatch({
                is_visible: value,
              })
            }
          />
          {translateUi("Page publique")}
        </label>

        <div className="flex overflow-hidden rounded-lg border text-xs">
          <button
            type="button"
            onClick={() =>
              onPatch({
                mode: "rich",
              })
            }
            className={[
              "px-3 py-1.5",
              page.mode === "rich"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground",
            ].join(" ")}
          >
            {translateUi("Rich")}
          </button>

          <button
            type="button"
            onClick={() =>
              onPatch({
                mode: "simple",
              })
            }
            className={[
              "border-l px-3 py-1.5",
              page.mode === "simple"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground",
            ].join(" ")}
          >
            Markdown
          </button>
        </div>
      </div>

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-between text-xs uppercase tracking-wide text-muted-foreground"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{tx("Métadonnées de la page", "Page metadata")}</span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs">{translateUi("Titre")}</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => {
                const value = title.trim();

                if (value && value !== page.title) {
                  onPatch({
                    title: value,
                  });
                }
              }}
            />
          </div>

          <div>
            <Label className="flex items-center justify-between text-xs">
              <span>Slug</span>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  const value = slugify(title);

                  setSlug(value);

                  if (value && value !== page.slug) {
                    onPatch({
                      slug: value,
                    });
                  }
                }}
              >
                Auto
              </button>
            </Label>

            <Input
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              onBlur={() => {
                if (slug && slug !== page.slug) {
                  onPatch({
                    slug,
                  });
                }
              }}
              className="font-mono text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs">{translateUi("URL publique")}</Label>

            <div className="flex gap-2">
              <Input value={publicUrl} readOnly className="font-mono text-xs" />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  void navigator.clipboard?.writeText(publicUrl);
                  toast.success(translateUi("Lien copié"));
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs">{translateUi("Titre SEO")}</Label>
            <Input
              value={seoTitle}
              maxLength={80}
              onChange={(event) => setSeoTitle(event.target.value)}
              onBlur={() => {
                onPatch({
                  seo_title: seoTitle.trim() || null,
                });
              }}
            />
          </div>

          <div>
            <Label className="text-xs">{translateUi("Meta description")}</Label>
            <Textarea
              value={seoDescription}
              maxLength={200}
              rows={2}
              onChange={(event) => setSeoDescription(event.target.value)}
              onBlur={() => {
                onPatch({
                  seo_description: seoDescription.trim() || null,
                });
              }}
            />
          </div>

          {page.mode === "simple" && (
            <div className="md:col-span-2">
              <Label className="text-xs">
                {translateUi("Contenu Markdown")}
              </Label>

              <Textarea
                value={content}
                rows={8}
                className="font-mono text-xs"
                onChange={(event) => setContent(event.target.value)}
                onBlur={() =>
                  onPatch({
                    content: content || null,
                  })
                }
              />

              {linkErrors.length > 0 && (
                <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  {linkErrors.map((error, index) => (
                    <div
                      key={index}
                      className="flex gap-2 text-xs text-destructive"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        {error.raw} — {error.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 md:col-span-2">
            <p className="text-xs text-muted-foreground">
              {tx(
                "Génération SEO assistée par BIB.",
                "SEO generation powered by BIB.",
              )}
            </p>

            <ActionButton
              size="sm"
              variant="outline"
              state={stateFromMutation(generateSeo)}
              loadingLabel={english ? "Generating…" : "Génération…"}
              successLabel={english ? "Generated" : "Généré"}
              errorLabel={english ? "Failed" : "Échec"}
              onClick={() => {
                generateSeo.mutate(
                  {
                    boutiqueId,
                    pageId: page.id,
                    pageTitle: page.title,
                    pageSlug: page.slug,
                    mode: page.mode,
                    contentSnippet: page.content,
                  },
                  {
                    onSuccess: ({ title, description }) => {
                      setSeoTitle(title);
                      setSeoDescription(description);

                      onPatch({
                        seo_title: title,
                        seo_description: description,
                      });

                      toast.success(translateUi("SEO généré"));
                    },
                    onError: (error) =>
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : translateUi("Génération impossible"),
                      ),
                  },
                );
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {translateUi("Générer le SEO")}
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
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
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data: brandDna } = useBrandDNA(boutiqueId);

  const { data: studioAnswers } = useStudioAnswers(boutiqueId);

  const { data: pages = [], isLoading: pagesLoading } =
    useBoutiquePages(boutiqueId);

  const [activePageId, setActivePageId] = useState<string | null>(null);

  // Scènes de la page actuellement éditée.
  const { data: scenes = [], isLoading: scenesLoading } = useBoutiqueScenes(
    boutiqueId,
    activePageId,
  );

  // La publication se valide toujours sur la page d'accueil,
  // indépendamment de la page sélectionnée dans l'éditeur.
  const {
    data: publicationScenes = [],
    isFetching: publicationScenesLoading,
    isError: publicationScenesError,
    refetch: refetchPublicationScenes,
  } = useBoutiqueScenes(boutiqueId, null);

  const publicationData = useBoutiquePublication(boutiqueId);
  const pendingMutations = useIsMutating();

  const updateScene = useUpdateScene();

  const reorderScenes = useReorderScenes();

  const addScene = useAddScene();

  const deleteScene = useDeleteScene();

  const updateBrandDna = useUpdateBrandDNA();

  const regenerateBrandDna = useGenerateBrandDNA();

  const reshuffle = useReshuffleStructure();

  const remixScene = useRemixScene();

  const generateSeo = useGenerateSeo();

  const saveSeo = useSaveSeo();

  const generateBrief = useGenerateContentBrief();

  const generateClusters = useGenerateKeywordClusters();

  const createPage = useCreateBoutiquePage();

  const updatePage = useUpdateBoutiquePage();

  const deletePage = useDeleteBoutiquePage();

  const reorderPages = useReorderBoutiquePages();

  const generatePageSeo = useGeneratePageSeo();

  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [pendingDeletePageId, setPendingDeletePageId] = useState<string | null>(
    null,
  );

  const pageCreationLocks = useRef(new Set<string>());
  const sceneMutationLocks = useRef(new Set<string>());
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);

  const [showAddScene, setShowAddScene] = useState(false);

  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");

  const [seoTitle, setSeoTitle] = useState(initialSeo?.title ?? "");

  const [seoDescription, setSeoDescription] = useState(
    initialSeo?.description ?? "",
  );

  const [seoH1, setSeoH1] = useState(initialSeo?.jsonld?.h1 ?? "");

  const [seoKeywords, setSeoKeywords] = useState(
    (initialSeo?.jsonld?.keywords ?? []).join(", "),
  );

  const [seoJsonld, setSeoJsonld] = useState<Array<Record<string, unknown>>>(
    initialSeo?.jsonld?.blocks ?? [],
  );

  const [seoActiveLocales, setSeoActiveLocales] = useState<string[]>(() => {
    const activeLocales = initialSeo?.activeLocales?.filter((locale) =>
      SUPPORTED_SEO_LOCALES.some(
        (supportedLocale) => supportedLocale.code === locale,
      ),
    );

    return activeLocales?.length ? activeLocales : ["fr", "en"];
  });

  const [seoDefaultLocale, setSeoDefaultLocale] = useState(() => {
    const initialActiveLocales = initialSeo?.activeLocales?.filter((locale) =>
      SUPPORTED_SEO_LOCALES.some(
        (supportedLocale) => supportedLocale.code === locale,
      ),
    );
    const activeLocales = initialActiveLocales?.length
      ? initialActiveLocales
      : ["fr", "en"];

    return initialSeo?.defaultLocale &&
      activeLocales.includes(initialSeo.defaultLocale)
      ? initialSeo.defaultLocale
      : activeLocales[0];
  });

  const [seoPublicOrigin, setSeoPublicOrigin] = useState(
    initialSeo?.publicOrigin ?? "",
  );

  const [seoDirty, setSeoDirty] = useState(false);

  const [brief, setBrief] = useState<ContentBrief | null>(null);

  const [clusters, setClusters] = useState<KeywordCluster[]>([]);

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? null,
    [pages, activePageId],
  );

  const activeScene = useMemo(
    () =>
      scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0] ?? null,
    [scenes, activeSceneId],
  );

  useEffect(() => {
    if (activePageId && !pages.some((page) => page.id === activePageId)) {
      setActivePageId(null);
    }
  }, [pages, activePageId]);

  useEffect(() => {
    setActiveSceneId(null);
  }, [activePageId]);

  useEffect(() => {
    setSeoTitle(initialSeo?.title ?? "");
    setSeoDescription(initialSeo?.description ?? "");
    setSeoH1(initialSeo?.jsonld?.h1 ?? "");
    setSeoKeywords((initialSeo?.jsonld?.keywords ?? []).join(", "));
    setSeoJsonld(initialSeo?.jsonld?.blocks ?? []);
    const configuredLocales = initialSeo?.activeLocales?.filter((locale) =>
      SUPPORTED_SEO_LOCALES.some(
        (supportedLocale) => supportedLocale.code === locale,
      ),
    );
    const activeLocales = configuredLocales?.length
      ? configuredLocales
      : ["fr", "en"];

    setSeoActiveLocales(activeLocales);
    setSeoDefaultLocale(
      initialSeo?.defaultLocale &&
        activeLocales.includes(initialSeo.defaultLocale)
        ? initialSeo.defaultLocale
        : activeLocales[0],
    );
    setSeoPublicOrigin(initialSeo?.publicOrigin ?? "");
    setSeoDirty(false);
  }, [boutiqueId, initialSeo]);

  const validation = useMemo(
    () =>
      validateBoutiquePublication({
        studioCompletedAt:
          publicationData.data?.boutique.studio_completed_at ?? null,
        scenes: publicationScenes,
        eligibleProductCount: publicationData.data?.eligibleProductCount ?? 0,
        seoTitle: seoDirty
          ? seoTitle
          : (publicationData.data?.boutique.seo_title ?? ""),
        seoDescription: seoDirty
          ? seoDescription
          : (publicationData.data?.boutique.seo_description ?? ""),
        loading:
          publicationScenesLoading ||
          publicationData.isFetching ||
          !publicationData.data,
        failed: publicationScenesError || publicationData.isError,
        saving: pendingMutations > 0,
      }),
    [
      publicationData.data,
      publicationData.isFetching,
      publicationData.isError,
      publicationScenes,
      publicationScenesLoading,
      publicationScenesError,
      seoDirty,
      seoTitle,
      seoDescription,
      pendingMutations,
    ],
  );

  const publish = useMutation({
    mutationFn: async () => {
      if (!validation.ok) {
        throw new Error("validation_failed");
      }

      if (seoDirty) {
        await saveSeo.mutateAsync({
          boutiqueId,
          title: seoTitle.trim(),
          description: seoDescription.trim(),
          h1: seoH1.trim() || undefined,
          keywords: seoKeywords
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean),
          jsonld: seoJsonld,
          activeLocales: seoActiveLocales,
          defaultLocale: seoDefaultLocale,
          publicOrigin: seoPublicOrigin.trim() || null,
        });
      }

      // Read persisted data immediately before the status write. Optimistic
      // scene cache and the eight-item preview are not publication authorities.
      let freshData;
      let freshScenes;
      try {
        [freshData, freshScenes] = await Promise.all([
          fetchBoutiquePublicationData(boutiqueId),
          supabase
            .from("boutique_scenes")
            .select("page_id, position, is_visible, role, variant, content")
            .eq("boutique_id", boutiqueId)
            .is("page_id", null)
            .order("position", { ascending: true }),
        ]);
      } catch {
        throw new Error("publication_read_failed");
      }
      if (freshScenes.error || !freshScenes.data) {
        throw new Error("publication_read_failed");
      }
      const freshValidation = validateBoutiquePublication({
        studioCompletedAt: freshData.boutique.studio_completed_at,
        scenes: freshScenes.data as PublicationScene[],
        eligibleProductCount: freshData.eligibleProductCount,
        seoTitle: freshData.boutique.seo_title ?? "",
        seoDescription: freshData.boutique.seo_description ?? "",
      });
      if (!freshValidation.ok) {
        await Promise.all([
          publicationData.refetch(),
          refetchPublicationScenes(),
        ]);
        throw new Error(
          `publication_blocked:${freshValidation.errors.join(" ")}`,
        );
      }

      const { data, error } = await supabase
        .from("boutiques")
        .update({
          status: "published",
        })
        .eq("id", boutiqueId)
        .select("id")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Publication refusée ou boutique introuvable.");
      }
    },

    onSuccess: () => {
      setSeoDirty(false);

      toast.success(translateUi("Boutique publiée."));

      queryClient.invalidateQueries({
        queryKey: ["boutique-edit", boutiqueId],
      });

      queryClient.invalidateQueries({
        queryKey: ["boutiques"],
      });

      queryClient.invalidateQueries({
        queryKey: ["public-boutique"],
      });
    },

    onError: (error) => {
      if (error instanceof Error && error.message === "validation_failed") {
        const firstIssue = validation.errors[0];

        toast.error(
          firstIssue
            ? `Publication bloquée : ${firstIssue}`
            : translateUi("La boutique doit être corrigée avant publication."),
        );

        return;
      }

      // Ne pas exposer les détails techniques de Supabase
      // ou de PostgreSQL dans l'interface marchand.
      const rawMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message ?? "")
          : "";

      if (rawMessage.startsWith("publication_blocked:")) {
        toast.error(
          translateUi("Publication bloquée : {v0}", {
            v0: rawMessage.slice("publication_blocked:".length),
          }),
        );
        return;
      }
      if (rawMessage === "publication_read_failed") {
        toast.error(
          translateUi(
            "Publication bloquée : impossible de vérifier les données enregistrées. Réessayez le chargement avant de publier.",
          ),
        );
        return;
      }

      const publicationMessages: Array<[string, string]> = [
        [
          "Brand Studio doit être terminé",
          "Terminez le Brand Studio avant de publier la boutique.",
        ],
        [
          "titre SEO doit contenir entre 10 et 60",
          "Le titre SEO doit contenir entre 10 et 60 caractères.",
        ],
        [
          "méta-description doit contenir entre 50 et 160",
          "La méta-description SEO doit contenir entre 50 et 160 caractères.",
        ],
        [
          "trois scènes visibles",
          "Ajoutez au moins trois scènes visibles à la boutique.",
        ],
        [
          "Hero, Vitrine produits et CTA",
          "Les scènes Hero, Vitrine produits et CTA doivent être visibles.",
        ],
        [
          "Hero doit avoir un titre et un CTA",
          "Complétez le titre et le bouton d’action du Hero.",
        ],
        [
          "aucun produit actif du catalogue BIB",
          "Ajoutez au moins un produit actif du catalogue BIB avant de publier.",
        ],
      ];

      const normalizedMessage = rawMessage.toLocaleLowerCase("fr");

      const matchedMessage = publicationMessages.find(([needle]) =>
        normalizedMessage.includes(needle.toLocaleLowerCase("fr")),
      )?.[1];

      toast.error(
        matchedMessage ??
          translateUi(
            "Publication impossible. Vérifiez les éléments requis et réessayez. Si le problème persiste, contactez le support BIB.",
          ),
      );
    },
  });

  const unpublish = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .update({ status: "draft" })
        .eq("id", boutiqueId)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data)
        throw new Error("Boutique introuvable ou dépublication refusée.");
    },
    onSuccess: () => {
      setShowUnpublishConfirm(false);
      toast.success(
        tx(
          translateUi("Boutique mise hors ligne."),
          translateUi("Store unpublished."),
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ["boutiques"] });
      void queryClient.invalidateQueries({
        queryKey: ["boutique-edit", boutiqueId],
      });
      void queryClient.invalidateQueries({ queryKey: ["public-boutique"] });
    },
    onError: () =>
      toast.error(
        tx(
          translateUi("Dépublication impossible. Réessayez."),
          translateUi("Could not unpublish the store. Try again."),
        ),
      ),
  });
  const handlePatchPage = (patch: Partial<PageLike>) => {
    if (!activePage) {
      return;
    }

    updatePage.mutate({
      pageId: activePage.id,
      boutiqueId,
      patch,
    });
  };

  const handleCreatePage = async (template: PageTemplate) => {
    const titleKey = normalizeStudioPageTitle(template.defaultTitle);
    const lockKey = `page-creation:${boutiqueId}`;
    if (pageCreationLocks.current.has(lockKey)) return;
    const existingPage = pages.find(
      (page) => normalizeStudioPageTitle(page.title) === titleKey,
    );
    if (existingPage) {
      setActivePageId(existingPage.id);
      toast.info(
        tx(
          translateUi("Cette page existe déjà ; elle a été ouverte."),
          translateUi("This page already exists and has been opened."),
        ),
      );
      return;
    }
    pageCreationLocks.current.add(lockKey);
    try {
      const page = await createPage.mutateAsync({
        boutiqueId,
        title: template.defaultTitle,
        mode: "rich",
      });

      if (template.seoTitle || template.seoDescription) {
        await updatePage.mutateAsync({
          pageId: page.id,
          boutiqueId,
          patch: {
            seo_title: template.seoTitle ?? null,
            seo_description: template.seoDescription ?? null,
          },
        });
      }

      for (let index = 0; index < template.scenes.length; index++) {
        const scene = template.scenes[index];

        const definition = findSceneDefinition(scene.sceneType);

        if (!definition) {
          continue;
        }

        await addScene.mutateAsync({
          boutiqueId,
          sceneType: scene.sceneType,
          position: index,
          variant: scene.variant,
          content: {
            ...definition.defaultContent,
            ...(scene.contentPatch ?? {}),
          },
          pageId: page.id,
        });
      }

      setActivePageId(page.id);

      toast.success(
        translateUi("Page « {v0} » créée.", { v0: template.defaultTitle }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : translateUi("Création impossible."),
      );
    } finally {
      pageCreationLocks.current.delete(lockKey);
    }
  };

  const handleOpenProductTemplate = async () => {
    const lockKey = `page-creation:${boutiqueId}`;
    if (pageCreationLocks.current.has(lockKey)) return;
    const existing = pages.find((page) => page.slug === PRODUCT_PAGE_SLUG);

    if (existing) {
      setActivePageId(existing.id);
      return;
    }

    pageCreationLocks.current.add(lockKey);
    try {
      const page = await createPage.mutateAsync({
        boutiqueId,
        title: translateUi("Modèle fiche produit"),
        mode: "rich",
        slug: PRODUCT_PAGE_SLUG,
        showInNav: false,
      });

      for (let index = 0; index < PRODUCT_PAGE_SCENES.length; index++) {
        const scene = PRODUCT_PAGE_SCENES[index];

        const definition = findSceneDefinition(scene.sceneType);

        if (!definition) {
          continue;
        }

        await addScene.mutateAsync({
          boutiqueId,
          sceneType: scene.sceneType,
          position: index,
          variant: scene.variant,
          content: {
            ...definition.defaultContent,
            ...(scene.contentPatch ?? {}),
          },
          pageId: page.id,
        });
      }

      setActivePageId(page.id);

      toast.success(translateUi("Modèle de page produit créé."));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : translateUi("Création impossible."),
      );
    } finally {
      pageCreationLocks.current.delete(lockKey);
    }
  };

  const handleAddScene = (sceneType: string) => {
    const definition = findSceneDefinition(sceneType);

    if (!definition) {
      return;
    }
    const lockKey = `${activePageId ?? "home"}:scene-add`;
    if (sceneMutationLocks.current.has(lockKey)) return;
    sceneMutationLocks.current.add(lockKey);

    addScene.mutate(
      {
        boutiqueId,
        sceneType,
        position: scenes.length,
        pageId: activePageId,
        variant: definition.variants[0],
        content: definition.defaultContent,
      },
      {
        onSuccess: () => {
          setShowAddScene(false);
          toast.success(translateUi("Scène ajoutée."));
        },
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : translateUi("Ajout impossible."),
          ),
        onSettled: () => sceneMutationLocks.current.delete(lockKey),
      },
    );
  };

  const handleDuplicateScene = (scene: SceneRecord) => {
    const lockKey = `${activePageId ?? "home"}:scene-add`;
    if (sceneMutationLocks.current.has(lockKey)) return;
    sceneMutationLocks.current.add(lockKey);
    addScene.mutate(
      {
        boutiqueId,
        sceneType: scene.scene_type,
        position: scenes.length,
        variant: scene.variant,
        content: scene.content,
        pageId: activePageId,
      },
      {
        onSuccess: () => toast.success(translateUi("Scène dupliquée.")),
        onError: () => toast.error(translateUi("Duplication impossible.")),
        onSettled: () => sceneMutationLocks.current.delete(lockKey),
      },
    );
  };

  const handleDeleteScene = async () => {
    if (!pendingDeleteId) {
      return;
    }

    await deleteScene.mutateAsync({
      boutiqueId,
      sceneId: pendingDeleteId,
    });

    if (activeSceneId === pendingDeleteId) {
      setActiveSceneId(null);
    }

    setPendingDeleteId(null);
  };

  const handleReorderScenes = (orderedIds: string[]) => {
    reorderScenes.mutate(
      {
        boutiqueId,
        orderedIds,
      },
      {
        onError: () => toast.error(translateUi("Réorganisation impossible.")),
      },
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = scenes.findIndex((scene) => scene.id === active.id);

    const newIndex = scenes.findIndex((scene) => scene.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reordered = arrayMove(scenes, oldIndex, newIndex);

    handleReorderScenes(reordered.map((scene) => scene.id));
  };

  const handleRemixScene = (scene: SceneRecord) => {
    remixScene.mutate(
      {
        boutiqueId,
        sceneId: scene.id,
        sceneType: scene.scene_type,
        variant: scene.variant,
        content: scene.content,
        brand: brandDna,
      },
      {
        onSuccess: () => toast.success(translateUi("Scène régénérée.")),
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : translateUi("Régénération impossible."),
          ),
      },
    );
  };

  const handleSeoGenerate = () => {
    generateSeo.mutate(
      {
        boutiqueId,
        persist: true,
        context: {
          boutiqueName,
          category,
          products: products.slice(0, 12),
          brand: brandDna,
        },
      },
      {
        onSuccess: (result) => {
          setSeoTitle(result.title);
          setSeoDescription(result.description);
          setSeoH1(result.h1);
          setSeoKeywords(result.keywords.join(", "));
          setSeoJsonld(result.jsonld);
          setSeoDirty(false);

          toast.success(translateUi("SEO généré."));
        },
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : translateUi("Génération impossible."),
          ),
      },
    );
  };

  const seoScore = computeSeoScore({
    title: seoTitle,
    description: seoDescription,
    h1: seoH1,
    keywords: seoKeywords
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    jsonldBlocks: 0,
  });

  const publicUrl = publicSlug ? `/boutique/${publicSlug}` : "#";

  if (pagesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/dashboard/boutiques")}
          >
            <ArrowLeft className="h-4 w-4" />
            {translateUi("Boutiques")}
          </Button>

          <div className="hidden h-6 w-px bg-border sm:block" />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-xl font-semibold">
                {boutiqueName}
              </h1>

              <Badge variant={isPublished ? "default" : "secondary"}>
                {isPublished ? translateUi("Publié") : translateUi("Brouillon")}
              </Badge>
            </div>

            <p className="truncate font-mono text-xs text-muted-foreground">
              {publicUrl}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isPublished && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive"
              disabled={unpublish.isPending}
              onClick={() => setShowUnpublishConfirm(true)}
            >
              <EyeOff className="h-4 w-4" />
              {tx("Dépublier", "Unpublish")}
            </Button>
          )}

          {isPublished && (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                {translateUi("Voir la boutique")}
              </a>
            </Button>
          )}

          <ActionButton
            size="sm"
            disabled={!validation.ok || unpublish.isPending}
            aria-describedby={
              !validation.ok ? "publication-validation" : undefined
            }
            state={stateFromMutation(publish)}
            loadingLabel="Publication…"
            successLabel="Publié"
            errorLabel={english ? "Failed" : "Échec"}
            onClick={() => publish.mutate()}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {translateUi("Publier")}
          </ActionButton>
        </div>
      </div>

      {!validation.ok && (
        <div
          id="publication-validation"
          role="status"
          aria-live="polite"
          className="mt-3 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm"
        >
          <p className="font-medium">
            {isPublished
              ? translateUi("Boutique publiée : points à corriger")
              : translateUi("À corriger avant publication")}
          </p>

          {isPublished && (
            <p className="mt-1 text-muted-foreground">
              {translateUi(
                "La boutique reste publiée. Corrigez ces points pour préserver son accueil et son catalogue.",
              )}
            </p>
          )}
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {validation.errors.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActivePageId(null)}
            >
              {tx("Accueil", "Home")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/dashboard/produits")}
            >
              {translateUi("Gérer les produits")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={publicationScenesLoading || publicationData.isFetching}
              onClick={() => {
                void publicationData.refetch();
                void refetchPublicationScenes();
              }}
            >
              {translateUi("Réessayer la vérification")}
            </Button>
          </div>
        </div>
      )}

      {/* Pages */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h2 className="font-semibold">
              {translateUi("Pages de la boutique")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {tx(
                "Les pages sont persistées dans BIB et ne dépendent pas du navigateur.",
                "Pages are saved to BIB and are available across browsers.",
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {PAGE_TEMPLATES.filter(
              (template) =>
                !pages.some(
                  (page) =>
                    normalizeStudioPageTitle(page.title) ===
                    normalizeStudioPageTitle(template.defaultTitle),
                ),
            ).map((template) => (
              <Button
                key={template.key}
                size="sm"
                variant="outline"
                disabled={createPage.isPending}
                onClick={() => handleCreatePage(template)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {template.defaultTitle}
              </Button>
            ))}

            <Button
              size="sm"
              variant="outline"
              disabled={createPage.isPending}
              onClick={handleOpenProductTemplate}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {translateUi("Page produit")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4">
          <Button
            variant={activePageId === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActivePageId(null)}
          >
            {translateUi("Accueil")}
          </Button>

          {pages.map((page) => (
            <div key={page.id} className="flex items-center">
              <Button
                variant={activePageId === page.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePageId(page.id)}
              >
                {page.title}
              </Button>

              {page.slug !== PRODUCT_PAGE_SLUG && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setPendingDeletePageId(page.id)}
                  aria-label={translateUi("Supprimer {v0}", { v0: page.title })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {activePage && (
          <PageMetadata
            page={activePage}
            boutiqueId={boutiqueId}
            boutiqueSlug={publicSlug}
            onPatch={handlePatchPage}
          />
        )}
      </Card>

      {/* Main editor */}
      <div className="grid min-h-[min(620px,75vh)] min-w-0 gap-4 2xl:grid-cols-[390px_minmax(0,1fr)] 2xl:gap-5">
        {/* Left rail */}
        <Card className="min-w-0 overflow-hidden">
          <Tabs defaultValue="scenes" className="flex h-full flex-col">
            <TabsList className="m-3 grid grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="scenes">{translateUi("Scènes")}</TabsTrigger>
              <TabsTrigger value="brand">{translateUi("Identité")}</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="stories">Stories</TabsTrigger>
            </TabsList>

            <TabsContent
              value="scenes"
              className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {activePage ? activePage.title : translateUi("Accueil")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {scenes.length} {translateUi("scène")}
                    {scenes.length > 1 ? "s" : ""}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setShowAddScene((value) => !value)}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  {translateUi("Ajouter")}
                </Button>
              </div>

              {showAddScene && (
                <Card className="mb-4 space-y-2 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {translateUi("Bibliothèque de scènes")}
                  </p>

                  {(() => {
                    const recommended = recommendedSceneTypesForPage(
                      activePage?.title ?? "accueil",
                      activePage?.slug,
                    );

                    const recommendedSet = new Set(recommended);

                    const ordered = [
                      ...recommended
                        .map((id) =>
                          STUDIO_SCENES.find((scene) => scene.id === id),
                        )
                        .filter(Boolean),
                      ...STUDIO_SCENES.filter(
                        (scene) => !recommendedSet.has(scene.id),
                      ),
                    ];

                    return ordered.map((definition) => (
                      <button
                        key={definition!.id}
                        type="button"
                        onClick={() => handleAddScene(definition!.id)}
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-muted"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {definition!.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {definition!.tagline}
                          </span>
                        </span>

                        <Plus className="h-4 w-4 shrink-0" />
                      </button>
                    ));
                  })()}
                </Card>
              )}

              {scenesLoading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : scenes.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <Sparkles className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {translateUi("Aucune scène")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tx(
                      "Ajoutez une scène depuis la bibliothèque.",
                      "Add a scene from the library.",
                    )}
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={scenes.map((scene) => scene.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {scenes.map((scene) => (
                        <SortableSceneRow
                          key={scene.id}
                          scene={scene}
                          active={activeScene?.id === scene.id}
                          onSelect={() => setActiveSceneId(scene.id)}
                          onToggle={() =>
                            updateScene.mutate({
                              sceneId: scene.id,
                              boutiqueId,
                              patch: {
                                is_visible: !scene.is_visible,
                              },
                            })
                          }
                          onDuplicate={() => handleDuplicateScene(scene)}
                          onDelete={() => setPendingDeleteId(scene.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {activeScene && (
                <div className="mt-4">
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
                    onRemix={() => handleRemixScene(activeScene)}
                    remixState={stateFromMutation(remixScene)}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="brand"
              className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-5"
            >
              {!brandDna ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <p className="text-sm font-medium">
                    {translateUi("Identité non disponible")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {translateUi(
                      "Le Brand Studio doit être complété avant de modifier l'identité.",
                    )}
                  </p>
                </div>
              ) : (
                <BrandPanel
                  boutiqueId={boutiqueId}
                  brandDna={brandDna}
                  studioAnswers={studioAnswers}
                  updateBrandDna={updateBrandDna}
                  regenerateBrandDna={regenerateBrandDna}
                />
              )}
            </TabsContent>

            <TabsContent
              value="seo"
              className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-5"
            >
              <div className="space-y-4">
                <Card className="space-y-4 p-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      {translateUi("Référencement international")}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {translateUi(
                        "Configure les langues déclarées pour cette boutique et son origine publique.",
                      )}
                      {tx(
                        "Les traductions du contenu doivent être gérées séparément.",
                        "Content translations must be managed separately.",
                      )}
                    </p>
                  </div>

                  <div>
                    <Label>{tx("Langues actives", "Active languages")}</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {SUPPORTED_SEO_LOCALES.map((locale) => {
                        const checked = seoActiveLocales.includes(locale.code);

                        return (
                          <label
                            key={locale.code}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? [
                                      ...new Set([
                                        ...seoActiveLocales,
                                        locale.code,
                                      ]),
                                    ]
                                  : seoActiveLocales.filter(
                                      (code) => code !== locale.code,
                                    );

                                if (next.length === 0) {
                                  toast.error(
                                    translateUi(
                                      "Sélectionne au moins une langue.",
                                    ),
                                  );
                                  return;
                                }

                                const nextDefault = next.includes(
                                  seoDefaultLocale,
                                )
                                  ? seoDefaultLocale
                                  : next[0];

                                setSeoActiveLocales(next);
                                setSeoDefaultLocale(nextDefault);
                                setSeoDirty(true);
                              }}
                              className="h-4 w-4 accent-primary"
                            />
                            <span>{locale.label}</span>
                            <span className="ml-auto font-mono text-xs text-muted-foreground">
                              {locale.code.toUpperCase()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>{translateUi("Langue par défaut")}</Label>
                    <Select
                      value={seoDefaultLocale}
                      onValueChange={(value) => {
                        if (!seoActiveLocales.includes(value)) {
                          setSeoActiveLocales((current) => [...current, value]);
                        }

                        setSeoDefaultLocale(value);
                        setSeoDirty(true);
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue
                          placeholder={
                            english ? "Choose a language" : "Choisir une langue"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_SEO_LOCALES.filter((locale) =>
                          seoActiveLocales.includes(locale.code),
                        ).map((locale) => (
                          <SelectItem key={locale.code} value={locale.code}>
                            {locale.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>
                      {translateUi(
                        "Origine publique personnalisée (facultatif)",
                      )}
                    </Label>
                    <Input
                      className="mt-2"
                      value={seoPublicOrigin}
                      placeholder="https://boutique.exemple.com"
                      type="url"
                      onChange={(event) => {
                        setSeoPublicOrigin(event.target.value);
                        setSeoDirty(true);
                      }}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {translateUi(
                        "Indique uniquement le domaine et le protocole, sans chemin, paramètres ni fragment. Laisse vide pour utiliser le domaine public de BIB.",
                      )}
                    </p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      {translateUi("Score SEO")}
                    </h3>

                    <span className="text-2xl font-bold">
                      {seoScore.score}
                      <span className="text-xs text-muted-foreground">
                        /100
                      </span>
                    </span>
                  </div>

                  <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${seoScore.score}%`,
                      }}
                    />
                  </div>

                  <ul className="space-y-1.5">
                    {seoScore.checks.map((check) => (
                      <li
                        key={check.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        {check.ok ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        {check.label}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="space-y-3 p-4">
                  <div>
                    <Label>{translateUi("Titre SEO")}</Label>
                    <Input
                      value={seoTitle}
                      maxLength={80}
                      onChange={(event) => {
                        setSeoTitle(event.target.value);
                        setSeoDirty(true);
                      }}
                    />
                  </div>

                  <div>
                    <Label>{translateUi("Meta description")}</Label>
                    <Textarea
                      value={seoDescription}
                      maxLength={200}
                      rows={4}
                      onChange={(event) => {
                        setSeoDescription(event.target.value);
                        setSeoDirty(true);
                      }}
                    />
                  </div>

                  <div>
                    <Label>H1</Label>
                    <Input
                      value={seoH1}
                      onChange={(event) => {
                        setSeoH1(event.target.value);
                        setSeoDirty(true);
                      }}
                    />
                  </div>

                  <div>
                    <Label>{translateUi("Mots-clés")}</Label>
                    <Textarea
                      value={seoKeywords}
                      rows={3}
                      placeholder={translateUi("boutique, marque, produit...")}
                      onChange={(event) => {
                        setSeoKeywords(event.target.value);
                        setSeoDirty(true);
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleSeoGenerate}
                      disabled={generateSeo.isPending}
                    >
                      {generateSeo.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      {translateUi("Générer")}
                    </Button>

                    <Button
                      className="flex-1"
                      onClick={() => {
                        saveSeo.mutate(
                          {
                            boutiqueId,
                            title: seoTitle.trim(),
                            description: seoDescription.trim(),
                            h1: seoH1.trim() || undefined,
                            keywords: seoKeywords
                              .split(",")
                              .map((value) => value.trim())
                              .filter(Boolean),
                            jsonld: seoJsonld,
                            activeLocales: seoActiveLocales,
                            defaultLocale: seoDefaultLocale,
                            publicOrigin: seoPublicOrigin.trim() || null,
                          },
                          {
                            onSuccess: () => {
                              setSeoDirty(false);
                              toast.success(translateUi("SEO enregistré."));
                            },
                          },
                        );
                      }}
                      disabled={saveSeo.isPending || !seoDirty}
                    >
                      {saveSeo.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {translateUi("Enregistrer")}
                    </Button>
                  </div>
                </Card>

                <Card className="space-y-3 p-4">
                  <h3 className="text-sm font-semibold">
                    {translateUi("SEO avancé")}
                  </h3>

                  <ActionButton
                    size="sm"
                    variant="outline"
                    state={stateFromMutation(generateBrief)}
                    loadingLabel={english ? "Generating…" : "Génération…"}
                    successLabel={english ? "Generated" : "Généré"}
                    errorLabel={english ? "Failed" : "Échec"}
                    onClick={() => {
                      generateBrief.mutate(
                        {
                          boutiqueId,
                          context: {
                            boutiqueName,
                            category,
                            products: products.slice(0, 12),
                            brand: brandDna,
                          },
                        },
                        {
                          onSuccess: (result) => setBrief(result),
                        },
                      );
                    }}
                  >
                    {translateUi("Générer un brief éditorial")}
                  </ActionButton>

                  <ActionButton
                    size="sm"
                    variant="outline"
                    state={stateFromMutation(generateClusters)}
                    loadingLabel={english ? "Generating…" : "Génération…"}
                    successLabel={english ? "Generated" : "Généré"}
                    errorLabel={english ? "Failed" : "Échec"}
                    onClick={() => {
                      generateClusters.mutate(
                        {
                          boutiqueId,
                          context: {
                            boutiqueName,
                            category,
                            products: products.slice(0, 12),
                            brand: brandDna,
                          },
                        },
                        {
                          onSuccess: (result) => setClusters(result),
                        },
                      );
                    }}
                  >
                    {translateUi("Générer les clusters de mots-clés")}
                  </ActionButton>

                  {brief && (
                    <div className="rounded-lg border bg-muted/20 p-3 text-xs">
                      <p className="font-medium">{brief.recommended_h1}</p>
                      <p className="mt-1 text-muted-foreground">
                        {translateUi("Requête cible :")} {brief.target_query}
                      </p>

                      <div className="mt-3 space-y-2">
                        {brief.outline.map((item) => (
                          <div key={item.h2}>
                            <strong>{item.h2}</strong>
                            <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                              {item.talking_points.map((point) => (
                                <li key={point}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {clusters.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {clusters
                        .flatMap((cluster) => [
                          cluster.pillar_keyword,
                          ...cluster.supporting_keywords,
                        ])
                        .map((keyword) => (
                          <Badge key={keyword} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>

            <TabsContent
              value="stories"
              className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 pb-5"
            >
              <StoriesManager boutiqueId={boutiqueId} />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Preview */}
        <Card className="min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
            <div>
              <p className="text-sm font-semibold">{translateUi("Aperçu")}</p>
              <p className="text-xs text-muted-foreground">
                {tx(
                  "Les modifications sont prévisualisées directement.",
                  "Changes are previewed live.",
                )}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-lg border p-1">
              <Button
                size="icon"
                variant={previewDevice === "desktop" ? "default" : "ghost"}
                className="h-8 w-8"
                onClick={() => setPreviewDevice("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant={previewDevice === "tablet" ? "default" : "ghost"}
                className="h-8 w-8"
                onClick={() => setPreviewDevice("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant={previewDevice === "mobile" ? "default" : "ghost"}
                className="h-8 w-8"
                onClick={() => setPreviewDevice("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-[min(640px,70vh)] max-h-[80vh] overflow-auto 2xl:min-h-[640px] 2xl:max-h-none">
            <PreviewFrame device={previewDevice}>
              <StudioSceneRenderer
                scenes={scenes}
                brandDna={brandDna ?? null}
                boutiqueName={boutiqueName}
                products={products}
                boutiqueSlug={publicSlug}
              />
            </PreviewFrame>
          </div>
        </Card>
      </div>

      <AlertDialog
        open={showUnpublishConfirm}
        onOpenChange={setShowUnpublishConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tx("Mettre la boutique hors ligne ?", "Take the store offline?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tx(
                "La boutique ne sera plus accessible publiquement. Ses pages, scènes et produits seront conservés ; vous pourrez la republier depuis le Studio.",
                "The store will no longer be publicly accessible. Its pages, scenes, and products will be kept; you can publish it again from Studio.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unpublish.isPending}>
              {tx("Annuler", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={unpublish.isPending}
              onClick={(event) => {
                event.preventDefault();
                unpublish.mutate();
              }}
            >
              {unpublish.isPending
                ? tx("Dépublication…", "Unpublishing…")
                : tx("Confirmer la dépublication", "Confirm unpublishing")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete scene */}
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {translateUi("Supprimer cette scène ?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tx(
                "Cette suppression est définitive pour cette boutique.",
                "This permanently deletes the scene from this boutique.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{translateUi("Annuler")}</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDeleteScene()}
            >
              {translateUi("Supprimer")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete page */}
      <AlertDialog
        open={!!pendingDeletePageId}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeletePageId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {translateUi("Supprimer cette page ?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {translateUi(
                "Les scènes rattachées à cette page seront également supprimées.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{translateUi("Annuler")}</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!pendingDeletePageId) {
                  return;
                }

                try {
                  await deletePage.mutateAsync({
                    pageId: pendingDeletePageId,
                    boutiqueId,
                  });

                  if (activePageId === pendingDeletePageId) {
                    setActivePageId(null);
                  }

                  setPendingDeletePageId(null);

                  toast.success(translateUi("Page supprimée."));
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : translateUi("Suppression impossible."),
                  );
                }
              }}
            >
              {translateUi("Supprimer")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BrandPanel({
  boutiqueId,
  brandDna,
  studioAnswers,
  updateBrandDna,
  regenerateBrandDna,
}: {
  boutiqueId: string;
  brandDna: BrandDNA;
  studioAnswers: Record<string, unknown> | null | undefined;
  updateBrandDna: ReturnType<typeof useUpdateBrandDNA>;
  regenerateBrandDna: ReturnType<typeof useGenerateBrandDNA>;
}) {
  const copy = brandDna.generated_copy ?? {};

  const palette = brandDna.generated_palette ?? {};

  const typography = brandDna.generated_typography ?? {};

  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold">
            {translateUi("Identité de marque")}
          </p>
          <p className="text-xs text-muted-foreground">
            {tx(
              "Modifiez les éléments générés par le Brand Studio.",
              "Edit the elements generated by Brand Studio.",
            )}
          </p>
        </div>

        <ActionButton
          size="sm"
          variant="outline"
          state={stateFromMutation(regenerateBrandDna)}
          loadingLabel="…"
          successLabel="✓"
          errorLabel="!"
          onClick={() => {
            const answers = studioAnswers as any;

            if (!answers) {
              toast.error(
                translateUi(
                  "Les réponses du questionnaire de marque sont introuvables. Vérifie que le Brand Studio a bien été enregistré.",
                ),
              );
              return;
            }

            if (!answers.idealCustomer) {
              toast.error(
                translateUi("Les réponses du Brand Studio sont introuvables."),
              );
              return;
            }

            regenerateBrandDna.mutate(
              {
                boutiqueId,
                answers,
              },
              {
                onSuccess: () =>
                  toast.success(translateUi("Identité régénérée.")),
              },
            );
          }}
        >
          <Wand2 className="h-4 w-4" />
        </ActionButton>
      </Card>

      <div>
        <Label>{translateUi("Tagline")}</Label>
        <Input
          value={copy.tagline ?? ""}
          onChange={(event) =>
            updateBrandDna.mutate({
              boutiqueId,
              patch: {
                generated_copy: {
                  ...copy,
                  tagline: event.target.value,
                },
              },
            })
          }
        />
      </div>

      <div>
        <Label>{translateUi("Ambiance")}</Label>
        <Input
          value={brandDna.ambiance ?? ""}
          onChange={(event) =>
            updateBrandDna.mutate({
              boutiqueId,
              patch: {
                ambiance: event.target.value,
              },
            })
          }
        />
      </div>

      <div>
        <Label>{translateUi("Ton")}</Label>
        <Input
          value={brandDna.tone ?? ""}
          onChange={(event) =>
            updateBrandDna.mutate({
              boutiqueId,
              patch: {
                tone: event.target.value,
              },
            })
          }
        />
      </div>

      <div>
        <Label>{translateUi("Hero — titre")}</Label>
        <Input
          value={copy.hero_title ?? ""}
          onChange={(event) =>
            updateBrandDna.mutate({
              boutiqueId,
              patch: {
                generated_copy: {
                  ...copy,
                  hero_title: event.target.value,
                },
              },
            })
          }
        />
      </div>

      <div>
        <Label>{translateUi("Hero — sous-titre")}</Label>
        <Textarea
          rows={3}
          value={copy.hero_subtitle ?? ""}
          onChange={(event) =>
            updateBrandDna.mutate({
              boutiqueId,
              patch: {
                generated_copy: {
                  ...copy,
                  hero_subtitle: event.target.value,
                },
              },
            })
          }
        />
      </div>

      <div>
        <Label>{translateUi("Typographie")}</Label>

        <div className="mt-2 grid gap-2">
          <Select
            value={typography.display ?? ""}
            onValueChange={(value) => {
              loadGoogleFont(value);

              updateBrandDna.mutate({
                boutiqueId,
                patch: {
                  generated_typography: {
                    ...typography,
                    display: value,
                  },
                },
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={translateUi("Police titres")} />
            </SelectTrigger>

            <SelectContent className="max-h-72">
              {ALL_FONTS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typography.body ?? ""}
            onValueChange={(value) => {
              loadGoogleFont(value);

              updateBrandDna.mutate({
                boutiqueId,
                patch: {
                  generated_typography: {
                    ...typography,
                    body: value,
                  },
                },
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={translateUi("Police corps")} />
            </SelectTrigger>

            <SelectContent className="max-h-72">
              {ALL_FONTS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Palette</Label>

        <div className="mt-2 grid grid-cols-4 gap-2">
          {(["primary", "accent", "surface", "ink"] as const).map((key) => {
            const value = palette[key];

            return (
              <label key={key} className="cursor-pointer">
                <div
                  className="relative h-10 overflow-hidden rounded-lg border"
                  style={{
                    background: value ? `hsl(${value})` : undefined,
                  }}
                >
                  <input
                    type="color"
                    value={hslToHex(value)}
                    onChange={(event) =>
                      updateBrandDna.mutate({
                        boutiqueId,
                        patch: {
                          generated_palette: {
                            ...palette,
                            [key]: hexToHsl(event.target.value),
                          },
                        },
                      })
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>

                <span className="mt-1 block text-center text-[10px] capitalize text-muted-foreground">
                  {key}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {PALETTE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] hover:border-primary"
              onClick={() =>
                updateBrandDna.mutate({
                  boutiqueId,
                  patch: {
                    generated_palette: preset.palette,
                  },
                })
              }
            >
              {(["primary", "accent", "surface", "ink"] as const).map((key) => (
                <span
                  key={key}
                  className="h-3 w-3 rounded-sm border"
                  style={{
                    background: `hsl(${preset.palette[key]})`,
                  }}
                />
              ))}

              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>{tx("Mots-clés", "Keywords")}</Label>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {(brandDna.keywords ?? []).map((keyword) => (
            <Badge key={keyword} variant="outline">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
