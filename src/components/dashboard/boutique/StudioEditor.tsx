import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

import {
  ActionButton,
  stateFromMutation,
} from "./ActionButton";
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

import {
  ALL_FONTS,
  loadGoogleFont,
} from "@/lib/googleFonts";

import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";
import { supabase } from "@/integrations/supabase/client";
import { validateMarkdownLinks } from "@/lib/safeMarkdown";
import { ImageField } from "./SceneInspectorPro";

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
    jsonld?: {
      blocks?: Array<Record<string, unknown>>;
      keywords?: string[];
      h1?: string | null;
    } | null;
  };
}

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
    .match(
      /^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/,
    );

  if (!match) {
    return "#000000";
  }

  const h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;

  const a = s * Math.min(l, 1 - l);

  const channel = (n: number) => {
    const k = (n + h * 12) % 12;
    const c =
      l -
      a *
        Math.max(
          -1,
          Math.min(k - 3, 9 - k, 1),
        );

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

    s =
      l > 0.5
        ? d / (2 - max - min)
        : d / (max + min);

    switch (max) {
      case r:
        h =
          (g - b) / d +
          (g < b ? 6 : 0);
        break;

      case g:
        h =
          (b - r) / d +
          2;
        break;

      default:
        h =
          (r - g) / d +
          4;
        break;
    }

    h *= 60;
  }

  return `${Math.round(h)} ${Math.round(
    s * 100,
  )}% ${Math.round(l * 100)}%`;
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
  if (device === "desktop") {
    return <>{children}</>;
  }

  const width =
    device === "mobile"
      ? 375
      : 768;

  return (
    <div className="flex justify-center bg-muted/30 p-4">
      <div
        className="overflow-hidden rounded-2xl border bg-background shadow-xl"
        style={{
          width,
          maxWidth: "100%",
        }}
      >
        {children}
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

  const definition = findSceneDefinition(
    scene.scene_type,
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(
          transform,
        ),
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
        onClick={(event) =>
          event.stopPropagation()
        }
        className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-1 opacity-40 hover:bg-muted hover:opacity-100 active:cursor-grabbing"
        aria-label="Réorganiser la scène"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {definition?.name ??
              scene.scene_type}
          </span>

          <Badge
            variant="outline"
            className="text-[10px]"
          >
            {scene.role}
          </Badge>

          {!scene.is_visible && (
            <Badge
              variant="secondary"
              className="text-[10px]"
            >
              Masquée
            </Badge>
          )}
        </div>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {definition?.tagline}
        </p>
      </div>

      <div
        className="flex items-center gap-1"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <Switch
          checked={scene.is_visible}
          onCheckedChange={onToggle}
          aria-label="Afficher ou masquer"
        />

        <button
          type="button"
          className="rounded p-1 hover:bg-muted"
          onClick={onDuplicate}
          title="Dupliquer"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          className="rounded p-1 text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          title="Supprimer"
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
  onPatch: (
    patch: Partial<PageLike>,
  ) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const [title, setTitle] =
    useState(page.title);

  const [slug, setSlug] =
    useState(page.slug);

  const [seoTitle, setSeoTitle] =
    useState(page.seo_title ?? "");

  const [seoDescription, setSeoDescription] =
    useState(
      page.seo_description ?? "",
    );

  const [content, setContent] =
    useState(page.content ?? "");

  const generateSeo =
    useGeneratePageSeo();

  useEffect(() => {
    setTitle(page.title);
    setSlug(page.slug);
    setSeoTitle(page.seo_title ?? "");
    setSeoDescription(
      page.seo_description ?? "",
    );
    setContent(page.content ?? "");
  }, [
    page.id,
    page.title,
    page.slug,
    page.seo_title,
    page.seo_description,
    page.content,
  ]);

  const linkErrors = useMemo(
    () =>
      validateMarkdownLinks(content),
    [content],
  );

  const publicUrl =
    boutiqueSlug
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
          Page publique
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
            Rich
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
        onClick={() =>
          setOpen((value) => !value)
        }
      >
        <span>Métadonnées de la page</span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs">
              Titre
            </Label>
            <Input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              onBlur={() => {
                const value =
                  title.trim();

                if (
                  value &&
                  value !== page.title
                ) {
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
                  const value =
                    slugify(title);

                  setSlug(value);

                  if (
                    value &&
                    value !== page.slug
                  ) {
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
              onChange={(event) =>
                setSlug(
                  slugify(
                    event.target.value,
                  ),
                )
              }
              onBlur={() => {
                if (
                  slug &&
                  slug !== page.slug
                ) {
                  onPatch({
                    slug,
                  });
                }
              }}
              className="font-mono text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs">
              URL publique
            </Label>

            <div className="flex gap-2">
              <Input
                value={publicUrl}
                readOnly
                className="font-mono text-xs"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  void navigator.clipboard?.writeText(
                    publicUrl,
                  );
                  toast.success(
                    "Lien copié",
                  );
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs">
              Titre SEO
            </Label>
            <Input
              value={seoTitle}
              maxLength={80}
              onChange={(event) =>
                setSeoTitle(
                  event.target.value,
                )
              }
              onBlur={() => {
                onPatch({
                  seo_title:
                    seoTitle.trim() ||
                    null,
                });
              }}
            />
          </div>

          <div>
            <Label className="text-xs">
              Meta description
            </Label>
            <Textarea
              value={seoDescription}
              maxLength={200}
              rows={2}
              onChange={(event) =>
                setSeoDescription(
                  event.target.value,
                )
              }
              onBlur={() => {
                onPatch({
                  seo_description:
                    seoDescription.trim() ||
                    null,
                });
              }}
            />
          </div>

          {page.mode === "simple" && (
            <div className="md:col-span-2">
              <Label className="text-xs">
                Contenu Markdown
              </Label>

              <Textarea
                value={content}
                rows={8}
                className="font-mono text-xs"
                onChange={(event) =>
                  setContent(
                    event.target.value,
                  )
                }
                onBlur={() =>
                  onPatch({
                    content:
                      content || null,
                  })
                }
              />

              {linkErrors.length > 0 && (
                <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  {linkErrors.map(
                    (error, index) => (
                      <div
                        key={index}
                        className="flex gap-2 text-xs text-destructive"
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>
                          {error.raw} —{" "}
                          {error.message}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 md:col-span-2">
            <p className="text-xs text-muted-foreground">
              Génération SEO assistée par BIB.
            </p>

            <ActionButton
              size="sm"
              variant="outline"
              state={stateFromMutation(
                generateSeo,
              )}
              loadingLabel="Génération…"
              successLabel="Généré"
              errorLabel="Échec"
              onClick={() => {
                generateSeo.mutate(
                  {
                    boutiqueId,
                    pageId: page.id,
                    pageTitle:
                      page.title,
                    pageSlug:
                      page.slug,
                    mode: page.mode,
                    contentSnippet:
                      page.content,
                  },
                  {
                    onSuccess: ({
                      title,
                      description,
                    }) => {
                      setSeoTitle(
                        title,
                      );
                      setSeoDescription(
                        description,
                      );

                      onPatch({
                        seo_title:
                          title,
                        seo_description:
                          description,
                      });

                      toast.success(
                        "SEO généré",
                      );
                    },
                    onError: (error) =>
                      toast.error(
                        error instanceof
                          Error
                          ? error.message
                          : "Génération impossible",
                      ),
                  },
                );
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Générer le SEO
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
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const {
    data: brandDna,
  } = useBrandDNA(
    boutiqueId,
  );

  const {
    data: pages = [],
    isLoading: pagesLoading,
  } = useBoutiquePages(
    boutiqueId,
  );

  const [
    activePageId,
    setActivePageId,
  ] = useState<string | null>(
    null,
  );

  const {
    data: scenes = [],
    isLoading: scenesLoading,
  } = useBoutiqueScenes(
    boutiqueId,
    activePageId,
  );

  const updateScene =
    useUpdateScene();

  const reorderScenes =
    useReorderScenes();

  const addScene =
    useAddScene();

  const deleteScene =
    useDeleteScene();

  const updateBrandDna =
    useUpdateBrandDNA();

  const regenerateBrandDna =
    useGenerateBrandDNA();

  const reshuffle =
    useReshuffleStructure();

  const remixScene =
    useRemixScene();

  const generateSeo =
    useGenerateSeo();

  const saveSeo =
    useSaveSeo();

  const generateBrief =
    useGenerateContentBrief();

  const generateClusters =
    useGenerateKeywordClusters();

  const createPage =
    useCreateBoutiquePage();

  const updatePage =
    useUpdateBoutiquePage();

  const deletePage =
    useDeleteBoutiquePage();

  const reorderPages =
    useReorderBoutiquePages();

  const generatePageSeo =
    useGeneratePageSeo();

  const [
    activeSceneId,
    setActiveSceneId,
  ] = useState<string | null>(
    null,
  );

  const [
    pendingDeleteId,
    setPendingDeleteId,
  ] = useState<string | null>(
    null,
  );

  const [
    pendingDeletePageId,
    setPendingDeletePageId,
  ] = useState<string | null>(
    null,
  );

  const [
    showAddScene,
    setShowAddScene,
  ] = useState(false);

  const [
    previewDevice,
    setPreviewDevice,
  ] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");

  const [
    seoTitle,
    setSeoTitle,
  ] = useState(
    initialSeo?.title ?? "",
  );

  const [
    seoDescription,
    setSeoDescription,
  ] = useState(
    initialSeo?.description ?? "",
  );

  const [
    seoH1,
    setSeoH1,
  ] = useState(
    initialSeo?.jsonld?.h1 ?? "",
  );

  const [
    seoKeywords,
    setSeoKeywords,
  ] = useState(
    (
      initialSeo?.jsonld
        ?.keywords ?? []
    ).join(", "),
  );

  const [
    seoJsonld,
    setSeoJsonld,
  ] = useState<
    Array<Record<string, unknown>>
  >(
    initialSeo?.jsonld
      ?.blocks ?? [],
  );

  const [
    seoDirty,
    setSeoDirty,
  ] = useState(false);

  const [
    brief,
    setBrief,
  ] = useState<ContentBrief | null>(
    null,
  );

  const [
    clusters,
    setClusters,
  ] = useState<KeywordCluster[]>(
    [],
  );

  const activePage = useMemo(
    () =>
      pages.find(
        (page) =>
          page.id ===
          activePageId,
      ) ?? null,
    [
      pages,
      activePageId,
    ],
  );

  const activeScene = useMemo(
    () =>
      scenes.find(
        (scene) =>
          scene.id ===
          activeSceneId,
      ) ??
      scenes[0] ??
      null,
    [
      scenes,
      activeSceneId,
    ],
  );

  useEffect(() => {
    if (
      activePageId &&
      !pages.some(
        (page) =>
          page.id ===
          activePageId,
      )
    ) {
      setActivePageId(null);
    }
  }, [
    pages,
    activePageId,
  ]);

  useEffect(() => {
    setActiveSceneId(null);
  }, [
    activePageId,
  ]);

  useEffect(() => {
    setSeoTitle(
      initialSeo?.title ?? "",
    );
    setSeoDescription(
      initialSeo?.description ??
        "",
    );
    setSeoH1(
      initialSeo?.jsonld?.h1 ??
        "",
    );
    setSeoKeywords(
      (
        initialSeo?.jsonld
          ?.keywords ?? []
      ).join(", "),
    );
    setSeoJsonld(
      initialSeo?.jsonld
        ?.blocks ?? [],
    );
    setSeoDirty(false);
  }, [
    boutiqueId,
    initialSeo,
  ]);

  const validation = useMemo(() => {
    const errors: string[] =
      [];

    const visible =
      scenes.filter(
        (scene) =>
          scene.is_visible,
      );

    if (visible.length < 3) {
      errors.push(
        "Au moins 3 scènes visibles sont nécessaires.",
      );
    }

    const requiredRoles: SceneRole[] =
      [
        "hero",
        "showcase",
        "cta",
      ];

    for (const role of requiredRoles) {
      if (
        !visible.some(
          (scene) =>
            scene.role === role,
        )
      ) {
        errors.push(
          `Scène requise manquante : ${role}.`,
        );
      }
    }

    const hero =
      visible.find(
        (scene) =>
          scene.role ===
          "hero",
      );

    if (hero) {
      const content =
        hero.content as Record<
          string,
          unknown
        >;

      if (
        typeof content.title !==
          "string" ||
        content.title.trim()
          .length < 5
      ) {
        errors.push(
          "Le titre du Hero doit comporter au moins 5 caractères.",
        );
      }

      if (
        hero.variant ===
          "fullscreen" &&
        !content.backgroundImage &&
        !content.videoUrl
      ) {
        errors.push(
          "Le Hero plein écran doit avoir une image ou une vidéo.",
        );
      }

      if (
        typeof content.ctaLabel !==
          "string" ||
        content.ctaLabel.trim()
          .length < 2
      ) {
        errors.push(
          "Le CTA principal du Hero est requis.",
        );
      }
    }

    if (
      visible.some(
        (scene) =>
          scene.role ===
          "showcase",
      ) &&
      products.length === 0
    ) {
      errors.push(
        "La Vitrine produits est active mais aucun produit actif n'est disponible.",
      );
    }

    if (
      !seoTitle.trim() ||
      seoTitle.trim().length < 10
    ) {
      errors.push(
        "Le titre SEO doit comporter au moins 10 caractères.",
      );
    }

    if (
      seoTitle.length > 60
    ) {
      errors.push(
        "Le titre SEO ne doit pas dépasser 60 caractères.",
      );
    }

    if (
      !seoDescription.trim() ||
      seoDescription.trim()
        .length < 50
    ) {
      errors.push(
        "La meta description doit comporter au moins 50 caractères.",
      );
    }

    if (
      seoDescription.length > 160
    ) {
      errors.push(
        "La meta description ne doit pas dépasser 160 caractères.",
      );
    }

    return {
      ok: errors.length === 0,
      errors,
    };
  }, [
    scenes,
    products,
    seoTitle,
    seoDescription,
  ]);

  const publish = useMutation({
    mutationFn: async () => {
      if (!validation.ok) {
        throw new Error(
          "validation_failed",
        );
      }

      if (seoDirty) {
        await saveSeo.mutateAsync({
          boutiqueId,
          title: seoTitle.trim(),
          description:
            seoDescription.trim(),
          h1:
            seoH1.trim() ||
            undefined,
          keywords:
            seoKeywords
              .split(",")
              .map(
                (keyword) =>
                  keyword.trim(),
              )
              .filter(Boolean),
          jsonld: seoJsonld,
        });
      }

      const {
        data,
        error,
      } = await supabase
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
        throw new Error(
          "Publication refusée ou boutique introuvable.",
        );
      }
    },

    onSuccess: () => {
      setSeoDirty(false);

      toast.success(
        "Boutique publiée.",
      );

      queryClient.invalidateQueries(
        {
          queryKey: [
            "boutique-edit",
            boutiqueId,
          ],
        },
      );

      queryClient.invalidateQueries(
        {
          queryKey: [
            "boutiques",
          ],
        },
      );

      queryClient.invalidateQueries(
        {
          queryKey: [
            "public-boutique",
          ],
        },
      );
    },

    onError: (error) => {
      if (
        error instanceof Error &&
        error.message ===
          "validation_failed"
      ) {
        toast.error(
          "La boutique doit être corrigée avant publication.",
        );
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Publication impossible.",
      );
    },
  });

  const handlePatchPage = (
    patch: Partial<PageLike>,
  ) => {
    if (!activePage) {
      return;
    }

    updatePage.mutate({
      pageId: activePage.id,
      boutiqueId,
      patch,
    });
  };

  const handleCreatePage =
    async (
      template: PageTemplate,
    ) => {
      try {
        const page =
          await createPage.mutateAsync(
            {
              boutiqueId,
              title:
                template.defaultTitle,
              mode: "rich",
            },
          );

        if (
          template.seoTitle ||
          template.seoDescription
        ) {
          await updatePage.mutateAsync(
            {
              pageId: page.id,
              boutiqueId,
              patch: {
                seo_title:
                  template.seoTitle ??
                  null,
                seo_description:
                  template.seoDescription ??
                  null,
              },
            },
          );
        }

        for (
          let index = 0;
          index <
          template.scenes.length;
          index++
        ) {
          const scene =
            template.scenes[
              index
            ];

          const definition =
            findSceneDefinition(
              scene.sceneType,
            );

          if (!definition) {
            continue;
          }

          await addScene.mutateAsync(
            {
              boutiqueId,
              sceneType:
                scene.sceneType,
              position: index,
              variant:
                scene.variant,
              content: {
                ...definition.defaultContent,
                ...(scene.contentPatch ??
                  {}),
              },
              pageId: page.id,
            },
          );
        }

        setActivePageId(
          page.id,
        );

        toast.success(
          `Page « ${template.defaultTitle} » créée.`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Création impossible.",
        );
      }
    };

  const handleOpenProductTemplate =
    async () => {
      const existing =
        pages.find(
          (page) =>
            page.slug ===
            PRODUCT_PAGE_SLUG,
        );

      if (existing) {
        setActivePageId(
          existing.id,
        );
        return;
      }

      try {
        const page =
          await createPage.mutateAsync(
            {
              boutiqueId,
              title:
                "Modèle fiche produit",
              mode: "rich",
              slug:
                PRODUCT_PAGE_SLUG,
              showInNav: false,
            },
          );

        for (
          let index = 0;
          index <
          PRODUCT_PAGE_SCENES.length;
          index++
        ) {
          const scene =
            PRODUCT_PAGE_SCENES[
              index
            ];

          const definition =
            findSceneDefinition(
              scene.sceneType,
            );

          if (!definition) {
            continue;
          }

          await addScene.mutateAsync(
            {
              boutiqueId,
              sceneType:
                scene.sceneType,
              position: index,
              variant:
                scene.variant,
              content: {
                ...definition.defaultContent,
                ...(scene.contentPatch ??
                  {}),
              },
              pageId: page.id,
            },
          );
        }

        setActivePageId(
          page.id,
        );

        toast.success(
          "Modèle de page produit créé.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Création impossible.",
        );
      }
    };

  const handleAddScene =
    (sceneType: string) => {
      const definition =
        findSceneDefinition(
          sceneType,
        );

      if (!definition) {
        return;
      }

      addScene.mutate(
        {
          boutiqueId,
          sceneType,
          position:
            scenes.length,
          pageId:
            activePageId,
          variant:
            definition.variants[0],
          content:
            definition.defaultContent,
        },
        {
          onSuccess: () => {
            setShowAddScene(false);
            toast.success(
              "Scène ajoutée.",
            );
          },
          onError: (error) =>
            toast.error(
              error instanceof Error
                ? error.message
                : "Ajout impossible.",
            ),
        },
      );
    };

  const handleDuplicateScene =
    (scene: SceneRecord) => {
      addScene.mutate(
        {
          boutiqueId,
          sceneType:
            scene.scene_type,
          position:
            scenes.length,
          variant:
            scene.variant,
          content:
            scene.content,
          pageId:
            activePageId,
        },
        {
          onSuccess: () =>
            toast.success(
              "Scène dupliquée.",
            ),
          onError: () =>
            toast.error(
              "Duplication impossible.",
            ),
        },
      );
    };

  const handleDeleteScene =
    async () => {
      if (!pendingDeleteId) {
        return;
      }

      await deleteScene.mutateAsync({
        boutiqueId,
        sceneId:
          pendingDeleteId,
      });

      if (
        activeSceneId ===
        pendingDeleteId
      ) {
        setActiveSceneId(null);
      }

      setPendingDeleteId(null);
    };

  const handleReorderScenes =
    (
      orderedIds: string[],
    ) => {
      reorderScenes.mutate(
        {
          boutiqueId,
          orderedIds,
        },
        {
          onError: () =>
            toast.error(
              "Réorganisation impossible.",
            ),
        },
      );
    };

  const sensors =
    useSensors(
      useSensor(
        PointerSensor,
        {
          activationConstraint: {
            distance: 5,
          },
        },
      ),
      useSensor(
        KeyboardSensor,
        {
          coordinateGetter:
            sortableKeyboardCoordinates,
        },
      ),
    );

  const handleDragEnd = (
    event: DragEndEvent,
  ) => {
    const {
      active,
      over,
    } = event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    const oldIndex =
      scenes.findIndex(
        (scene) =>
          scene.id ===
          active.id,
      );

    const newIndex =
      scenes.findIndex(
        (scene) =>
          scene.id ===
          over.id,
      );

    if (
      oldIndex < 0 ||
      newIndex < 0
    ) {
      return;
    }

    const reordered =
      arrayMove(
        scenes,
        oldIndex,
        newIndex,
      );

    handleReorderScenes(
      reordered.map(
        (scene) =>
          scene.id,
      ),
    );
  };

  const handleRemixScene =
    (scene: SceneRecord) => {
      remixScene.mutate(
        {
          boutiqueId,
          sceneId: scene.id,
          sceneType:
            scene.scene_type,
          variant:
            scene.variant,
          content:
            scene.content,
          brand:
            brandDna,
        },
        {
          onSuccess: () =>
            toast.success(
              "Scène régénérée.",
            ),
          onError: (error) =>
            toast.error(
              error instanceof Error
                ? error.message
                : "Régénération impossible.",
            ),
        },
      );
    };

  const handleSeoGenerate =
    () => {
      generateSeo.mutate(
        {
          boutiqueId,
          persist: true,
          context: {
            boutiqueName,
            category,
            products:
              products.slice(
                0,
                12,
              ),
            brand: brandDna,
          },
        },
        {
          onSuccess: (result) => {
            setSeoTitle(
              result.title,
            );
            setSeoDescription(
              result.description,
            );
            setSeoH1(result.h1);
            setSeoKeywords(
              result.keywords.join(
                ", ",
              ),
            );
            setSeoJsonld(
              result.jsonld,
            );
            setSeoDirty(false);

            toast.success(
              "SEO généré.",
            );
          },
          onError: (error) =>
            toast.error(
              error instanceof Error
                ? error.message
                : "Génération impossible.",
            ),
        },
      );
    };

  const seoScore =
    computeSeoScore({
      title: seoTitle,
      description:
        seoDescription,
      h1: seoH1,
      keywords:
        seoKeywords
          .split(",")
          .map(
            (value) =>
              value.trim(),
          )
          .filter(Boolean),
      jsonldBlocks: 0,
    });

  const publicUrl =
    publicSlug
      ? `/boutique/${publicSlug}`
      : "#";

  if (pagesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() =>
              navigate(
                "/dashboard/boutiques",
              )
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Boutiques
          </Button>

          <div className="hidden h-6 w-px bg-border sm:block" />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-xl font-semibold">
                {boutiqueName}
              </h1>

              <Badge
                variant={
                  isPublished
                    ? "default"
                    : "secondary"
                }
              >
                {isPublished
                  ? "Publié"
                  : "Brouillon"}
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
              className="gap-2"
              asChild
            >
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Voir la boutique
              </a>
            </Button>
          )}

          <ActionButton
            size="sm"
            state={stateFromMutation(
              publish,
            )}
            loadingLabel="Publication…"
            successLabel="Publié"
            errorLabel="Échec"
            onClick={() =>
              publish.mutate()
            }
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Publier
          </ActionButton>
        </div>
      </div>

      {/* Pages */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h2 className="font-semibold">
              Pages de la boutique
            </h2>
            <p className="text-xs text-muted-foreground">
              Les pages sont persistées dans BIB et ne dépendent pas du navigateur.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {PAGE_TEMPLATES
              .filter(
                (template) =>
                  !pages.some(
                    (page) =>
                      page.title ===
                      template.defaultTitle,
                  ),
              )
              .map(
                (template) => (
                  <Button
                    key={template.key}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleCreatePage(
                        template,
                      )
                    }
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    {template.defaultTitle}
                  </Button>
                ),
              )}

            <Button
              size="sm"
              variant="outline"
              onClick={
                handleOpenProductTemplate
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Page produit
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4">
          <Button
            variant={
              activePageId === null
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() =>
              setActivePageId(null)
            }
          >
            Accueil
          </Button>

          {pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center"
            >
              <Button
                variant={
                  activePageId ===
                  page.id
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  setActivePageId(
                    page.id,
                  )
                }
              >
                {page.title}
              </Button>

              {page.slug !==
                PRODUCT_PAGE_SLUG && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() =>
                    setPendingDeletePageId(
                      page.id,
                    )
                  }
                  aria-label={`Supprimer ${page.title}`}
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
            boutiqueId={
              boutiqueId
            }
            boutiqueSlug={
              publicSlug
            }
            onPatch={
              handlePatchPage
            }
          />
        )}
      </Card>

      {/* Main editor */}
      <div className="grid min-h-[720px] gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
        {/* Left rail */}
        <Card className="overflow-hidden">
          <Tabs
            defaultValue="scenes"
            className="flex h-full flex-col"
          >
            <TabsList className="m-3 grid grid-cols-3">
              <TabsTrigger value="scenes">
                Scènes
              </TabsTrigger>
              <TabsTrigger value="brand">
                Identité
              </TabsTrigger>
              <TabsTrigger value="seo">
                SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="scenes"
              className="mt-0 flex-1 overflow-y-auto px-4 pb-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {activePage
                      ? activePage.title
                      : "Accueil"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {scenes.length} scène
                    {scenes.length >
                    1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() =>
                    setShowAddScene(
                      (value) =>
                        !value,
                    )
                  }
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Ajouter
                </Button>
              </div>

              {showAddScene && (
                <Card className="mb-4 space-y-2 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Bibliothèque de scènes
                  </p>

                  {(() => {
                    const recommended =
                      recommendedSceneTypesForPage(
                        activePage?.title ??
                          "accueil",
                        activePage?.slug,
                      );

                    const recommendedSet =
                      new Set(
                        recommended,
                      );

                    const ordered =
                      [
                        ...recommended
                          .map(
                            (id) =>
                              STUDIO_SCENES.find(
                                (
                                  scene,
                                ) =>
                                  scene.id ===
                                  id,
                              ),
                          )
                          .filter(Boolean),
                        ...STUDIO_SCENES.filter(
                          (scene) =>
                            !recommendedSet.has(
                              scene.id,
                            ),
                        ),
                      ];

                    return ordered.map(
                      (definition) => (
                        <button
                          key={
                            definition!.id
                          }
                          type="button"
                          onClick={() =>
                            handleAddScene(
                              definition!.id,
                            )
                          }
                          className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-muted"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {
                                definition!.name
                              }
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {
                                definition!.tagline
                              }
                            </span>
                          </span>

                          <Plus className="h-4 w-4 shrink-0" />
                        </button>
                      ),
                    );
                  })()}
                </Card>
              )}

              {scenesLoading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : scenes.length ===
                0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <Sparkles className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Aucune scène
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ajoutez une scène depuis la bibliothèque.
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={
                    closestCenter
                  }
                  onDragEnd={
                    handleDragEnd
                  }
                >
                  <SortableContext
                    items={scenes.map(
                      (scene) =>
                        scene.id,
                    )}
                    strategy={
                      verticalListSortingStrategy
                    }
                  >
                    <div className="space-y-2">
                      {scenes.map(
                        (scene) => (
                          <SortableSceneRow
                            key={
                              scene.id
                            }
                            scene={
                              scene
                            }
                            active={
                              activeScene?.id ===
                              scene.id
                            }
                            onSelect={() =>
                              setActiveSceneId(
                                scene.id,
                              )
                            }
                            onToggle={() =>
                              updateScene.mutate(
                                {
                                  sceneId:
                                    scene.id,
                                  boutiqueId,
                                  patch: {
                                    is_visible:
                                      !scene.is_visible,
                                  },
                                },
                              )
                            }
                            onDuplicate={() =>
                              handleDuplicateScene(
                                scene,
                              )
                            }
                            onDelete={() =>
                              setPendingDeleteId(
                                scene.id,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {activeScene && (
                <div className="mt-4">
                  <SceneInspectorPro
                    key={
                      activeScene.id
                    }
                    scene={
                      activeScene
                    }
                    boutiqueId={
                      boutiqueId
                    }
                    products={products}
                    onPatch={(
                      patch,
                    ) =>
                      updateScene.mutate(
                        {
                          sceneId:
                            activeScene.id,
                          boutiqueId,
                          patch,
                        },
                      )
                    }
                    onDelete={() =>
                      setPendingDeleteId(
                        activeScene.id,
                      )
                    }
                    onRemix={() =>
                      handleRemixScene(
                        activeScene,
                      )
                    }
                    remixState={stateFromMutation(
                      remixScene,
                    )}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="brand"
              className="mt-0 flex-1 overflow-y-auto px-4 pb-5"
            >
              {!brandDna ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <p className="text-sm font-medium">
                    Identité non disponible
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Le Brand Studio doit être complété avant de modifier l'identité.
                  </p>
                </div>
              ) : (
                <BrandPanel
                  boutiqueId={
                    boutiqueId
                  }
                  brandDna={
                    brandDna
                  }
                  updateBrandDna={
                    updateBrandDna
                  }
                  regenerateBrandDna={
                    regenerateBrandDna
                  }
                />
              )}
            </TabsContent>

            <TabsContent
              value="seo"
              className="mt-0 flex-1 overflow-y-auto px-4 pb-5"
            >
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Score SEO
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
                    {seoScore.checks.map(
                      (check) => (
                        <li
                          key={
                            check.label
                          }
                          className="flex items-center gap-2 text-xs"
                        >
                          {check.ok ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                          )}
                          {check.label}
                        </li>
                      ),
                    )}
                  </ul>
                </Card>

                <Card className="space-y-3 p-4">
                  <div>
                    <Label>
                      Titre SEO
                    </Label>
                    <Input
                      value={seoTitle}
                      maxLength={80}
                      onChange={(event) => {
                        setSeoTitle(
                          event.target
                            .value,
                        );
                        setSeoDirty(
                          true,
                        );
                      }}
                    />
                  </div>

                  <div>
                    <Label>
                      Meta description
                    </Label>
                    <Textarea
                      value={
                        seoDescription
                      }
                      maxLength={200}
                      rows={4}
                      onChange={(
                        event,
                      ) => {
                        setSeoDescription(
                          event
                            .target
                            .value,
                        );
                        setSeoDirty(
                          true,
                        );
                      }}
                    />
                  </div>

                  <div>
                    <Label>
                      H1
                    </Label>
                    <Input
                      value={seoH1}
                      onChange={(
                        event,
                      ) => {
                        setSeoH1(
                          event
                            .target
                            .value,
                        );
                        setSeoDirty(
                          true,
                        );
                      }}
                    />
                  </div>

                  <div>
                    <Label>
                      Mots-clés
                    </Label>
                    <Textarea
                      value={
                        seoKeywords
                      }
                      rows={3}
                      placeholder="boutique, marque, produit..."
                      onChange={(
                        event,
                      ) => {
                        setSeoKeywords(
                          event
                            .target
                            .value,
                        );
                        setSeoDirty(
                          true,
                        );
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={
                        handleSeoGenerate
                      }
                      disabled={
                        generateSeo.isPending
                      }
                    >
                      {generateSeo.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Générer
                    </Button>

                    <Button
                      className="flex-1"
                      onClick={() => {
                        saveSeo.mutate(
                          {
                            boutiqueId,
                            title:
                              seoTitle.trim(),
                            description:
                              seoDescription.trim(),
                            h1:
                              seoH1.trim() ||
                              undefined,
                            keywords:
                              seoKeywords
                                .split(
                                  ",",
                                )
                                .map(
                                  (
                                    value,
                                  ) =>
                                    value.trim(),
                                )
                                .filter(
                                  Boolean,
                                ),
                            jsonld:
                              seoJsonld,
                          },
                          {
                            onSuccess:
                              () => {
                                setSeoDirty(
                                  false,
                                );
                                toast.success(
                                  "SEO enregistré.",
                                );
                              },
                          },
                        );
                      }}
                      disabled={
                        saveSeo.isPending ||
                        !seoDirty
                      }
                    >
                      {saveSeo.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Enregistrer
                    </Button>
                  </div>
                </Card>

                <Card className="space-y-3 p-4">
                  <h3 className="text-sm font-semibold">
                    SEO avancé
                  </h3>

                  <ActionButton
                    size="sm"
                    variant="outline"
                    state={stateFromMutation(
                      generateBrief,
                    )}
                    loadingLabel="Génération…"
                    successLabel="Généré"
                    errorLabel="Échec"
                    onClick={() => {
                      generateBrief.mutate(
                        {
                          boutiqueId,
                          context: {
                            boutiqueName,
                            category,
                            products:
                              products.slice(
                                0,
                                12,
                              ),
                            brand:
                              brandDna,
                          },
                        },
                        {
                          onSuccess:
                            (
                              result,
                            ) =>
                              setBrief(
                                result,
                              ),
                        },
                      );
                    }}
                  >
                    Générer un brief éditorial
                  </ActionButton>

                  <ActionButton
                    size="sm"
                    variant="outline"
                    state={stateFromMutation(
                      generateClusters,
                    )}
                    loadingLabel="Génération…"
                    successLabel="Généré"
                    errorLabel="Échec"
                    onClick={() => {
                      generateClusters.mutate(
                        {
                          boutiqueId,
                          context: {
                            boutiqueName,
                            category,
                            products:
                              products.slice(
                                0,
                                12,
                              ),
                            brand:
                              brandDna,
                          },
                        },
                        {
                          onSuccess:
                            (
                              result,
                            ) =>
                              setClusters(
                                result,
                              ),
                        },
                      );
                    }}
                  >
                    Générer les clusters de mots-clés
                  </ActionButton>

                  {brief && (
                    <div className="rounded-lg border bg-muted/20 p-3 text-xs">
                      <p className="font-medium">
                        {brief.recommended_h1}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Requête cible :{" "}
                        {
                          brief.target_query
                        }
                      </p>

                      <div className="mt-3 space-y-2">
                        {brief.outline.map(
                          (item) => (
                            <div
                              key={
                                item.h2
                              }
                            >
                              <strong>
                                {
                                  item.h2
                                }
                              </strong>
                              <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                                {item.talking_points.map(
                                  (
                                    point,
                                  ) => (
                                    <li
                                      key={
                                        point
                                      }
                                    >
                                      {
                                        point
                                      }
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {clusters.length >
                    0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {clusters.flatMap(
                        (cluster) =>
                          [
                            cluster.pillar_keyword,
                            ...cluster.supporting_keywords,
                          ],
                      ).map(
                        (keyword) => (
                          <Badge
                            key={
                              keyword
                            }
                            variant="outline"
                          >
                            {
                              keyword
                            }
                          </Badge>
                        ),
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Preview */}
        <Card className="min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
            <div>
              <p className="text-sm font-semibold">
                Aperçu
              </p>
              <p className="text-xs text-muted-foreground">
                Les modifications sont prévisualisées directement.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-lg border p-1">
              <Button
                size="icon"
                variant={
                  previewDevice ===
                  "desktop"
                    ? "default"
                    : "ghost"
                }
                className="h-8 w-8"
                onClick={() =>
                  setPreviewDevice(
                    "desktop",
                  )
                }
              >
                <Monitor className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant={
                  previewDevice ===
                  "tablet"
                    ? "default"
                    : "ghost"
                }
                className="h-8 w-8"
                onClick={() =>
                  setPreviewDevice(
                    "tablet",
                  )
                }
              >
                <Tablet className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant={
                  previewDevice ===
                  "mobile"
                    ? "default"
                    : "ghost"
                }
                className="h-8 w-8"
                onClick={() =>
                  setPreviewDevice(
                    "mobile",
                  )
                }
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-[640px] overflow-auto">
            <PreviewFrame
              device={
                previewDevice
              }
            >
              <StudioSceneRenderer
                scenes={scenes}
                brandDna={
                  brandDna ?? null
                }
                boutiqueName={
                  boutiqueName
                }
                products={
                  products
                }
                boutiqueSlug={
                  publicSlug
                }
              />
            </PreviewFrame>
          </div>
        </Card>
      </div>

      {/* Delete scene */}
      <AlertDialog
        open={
          !!pendingDeleteId
        }
        onOpenChange={(
          open,
        ) => {
          if (!open) {
            setPendingDeleteId(
              null,
            );
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer cette scène ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette suppression est définitive pour cette boutique.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Annuler
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                void handleDeleteScene()
              }
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete page */}
      <AlertDialog
        open={
          !!pendingDeletePageId
        }
        onOpenChange={(
          open,
        ) => {
          if (!open) {
            setPendingDeletePageId(
              null,
            );
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer cette page ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Les scènes rattachées à cette page seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Annuler
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (
                  !pendingDeletePageId
                ) {
                  return;
                }

                try {
                  await deletePage.mutateAsync(
                    {
                      pageId:
                        pendingDeletePageId,
                      boutiqueId,
                    },
                  );

                  if (
                    activePageId ===
                    pendingDeletePageId
                  ) {
                    setActivePageId(
                      null,
                    );
                  }

                  setPendingDeletePageId(
                    null,
                  );

                  toast.success(
                    "Page supprimée.",
                  );
                } catch (error) {
                  toast.error(
                    error instanceof
                      Error
                      ? error.message
                      : "Suppression impossible.",
                  );
                }
              }}
            >
              Supprimer
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
  updateBrandDna,
  regenerateBrandDna,
}: {
  boutiqueId: string;
  brandDna: BrandDNA;
  updateBrandDna: ReturnType<
    typeof useUpdateBrandDNA
  >;
  regenerateBrandDna: ReturnType<
    typeof useGenerateBrandDNA
  >;
}) {
  const copy =
    brandDna.generated_copy ??
    {};

  const palette =
    brandDna.generated_palette ??
    {};

  const typography =
    brandDna.generated_typography ??
    {};

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold">
            Identité de marque
          </p>
          <p className="text-xs text-muted-foreground">
            Modifiez les éléments générés par le Brand Studio.
          </p>
        </div>

        <ActionButton
          size="sm"
          variant="outline"
          state={stateFromMutation(
            regenerateBrandDna,
          )}
          loadingLabel="…"
          successLabel="✓"
          errorLabel="!"
          onClick={() => {
            const answers =
              brandDna.studio_answers as any;

            if (!answers?.audience) {
              toast.error(
                "Les réponses du Brand Studio sont introuvables.",
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
                  toast.success(
                    "Identité régénérée.",
                  ),
              },
            );
          }}
        >
          <Wand2 className="h-4 w-4" />
        </ActionButton>
      </Card>

      <div>
        <Label>Tagline</Label>
        <Input
          value={
            copy.tagline ?? ""
          }
          onChange={(event) =>
            updateBrandDna.mutate(
              {
                boutiqueId,
                patch: {
                  generated_copy: {
                    ...copy,
                    tagline:
                      event.target.value,
                  },
                },
              },
            )
          }
        />
      </div>

      <div>
        <Label>Ambiance</Label>
        <Input
          value={
            brandDna.ambiance ??
            ""
          }
          onChange={(event) =>
            updateBrandDna.mutate(
              {
                boutiqueId,
                patch: {
                  ambiance:
                    event.target.value,
                },
              },
            )
          }
        />
      </div>

      <div>
        <Label>Ton</Label>
        <Input
          value={
            brandDna.tone ?? ""
          }
          onChange={(event) =>
            updateBrandDna.mutate(
              {
                boutiqueId,
                patch: {
                  tone:
                    event.target.value,
                },
              },
            )
          }
        />
      </div>

      <div>
        <Label>Hero — titre</Label>
        <Input
          value={
            copy.hero_title ??
            ""
          }
          onChange={(event) =>
            updateBrandDna.mutate(
              {
                boutiqueId,
                patch: {
                  generated_copy: {
                    ...copy,
                    hero_title:
                      event.target.value,
                  },
                },
              },
            )
          }
        />
      </div>

      <div>
        <Label>Hero — sous-titre</Label>
        <Textarea
          rows={3}
          value={
            copy.hero_subtitle ??
            ""
          }
          onChange={(event) =>
            updateBrandDna.mutate(
              {
                boutiqueId,
                patch: {
                  generated_copy: {
                    ...copy,
                    hero_subtitle:
                      event.target.value,
                  },
                },
              },
            )
          }
        />
      </div>

      <div>
        <Label>Typographie</Label>

        <div className="mt-2 grid gap-2">
          <Select
            value={
              typography.display ??
              ""
            }
            onValueChange={(
              value,
            ) => {
              loadGoogleFont(
                value,
              );

              updateBrandDna.mutate(
                {
                  boutiqueId,
                  patch: {
                    generated_typography:
                      {
                        ...typography,
                        display:
                          value,
                      },
                  },
                },
              );
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Police titres" />
            </SelectTrigger>

            <SelectContent className="max-h-72">
              {ALL_FONTS.map(
                (font) => (
                  <SelectItem
                    key={font}
                    value={font}
                  >
                    {font}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select
            value={
              typography.body ??
              ""
            }
            onValueChange={(
              value,
            ) => {
              loadGoogleFont(
                value,
              );

              updateBrandDna.mutate(
                {
                  boutiqueId,
                  patch: {
                    generated_typography:
                      {
                        ...typography,
                        body: value,
                      },
                  },
                },
              );
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Police corps" />
            </SelectTrigger>

            <SelectContent className="max-h-72">
              {ALL_FONTS.map(
                (font) => (
                  <SelectItem
                    key={font}
                    value={font}
                  >
                    {font}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Palette</Label>

        <div className="mt-2 grid grid-cols-4 gap-2">
          {(
            [
              "primary",
              "accent",
              "surface",
              "ink",
            ] as const
          ).map((key) => {
            const value =
              palette[key];

            return (
              <label
                key={key}
                className="cursor-pointer"
              >
                <div
                  className="relative h-10 overflow-hidden rounded-lg border"
                  style={{
                    background:
                      value
                        ? `hsl(${value})`
                        : undefined,
                  }}
                >
                  <input
                    type="color"
                    value={hslToHex(
                      value,
                    )}
                    onChange={(
                      event,
                    ) =>
                      updateBrandDna.mutate(
                        {
                          boutiqueId,
                          patch: {
                            generated_palette:
                              {
                                ...palette,
                                [key]:
                                  hexToHsl(
                                    event
                                      .target
                                      .value,
                                  ),
                              },
                          },
                        },
                      )
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
          {PALETTE_PRESETS.map(
            (preset) => (
              <button
                key={
                  preset.name
                }
                type="button"
                className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] hover:border-primary"
                onClick={() =>
                  updateBrandDna.mutate(
                    {
                      boutiqueId,
                      patch: {
                        generated_palette:
                          preset.palette,
                      },
                    },
                  )
                }
              >
                {(
                  [
                    "primary",
                    "accent",
                    "surface",
                    "ink",
                  ] as const
                ).map(
                  (key) => (
                    <span
                      key={key}
                      className="h-3 w-3 rounded-sm border"
                      style={{
                        background: `hsl(${preset.palette[key]})`,
                      }}
                    />
                  ),
                )}

                {preset.name}
              </button>
            ),
          )}
        </div>
      </div>

      <div>
        <Label>Mots-clés</Label>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {(
            brandDna.keywords ??
            []
          ).map(
            (keyword) => (
              <Badge
                key={keyword}
                variant="outline"
              >
                {keyword}
              </Badge>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
