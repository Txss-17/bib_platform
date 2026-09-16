import { useRef, useState, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface Story {
  id: string;
  kind: "image" | "video";
  url: string;
  label?: string;
  cta_url?: string;
  enabled?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

/*
 * La donnée est toujours stockée dans :
 *
 * boutiques.highlight_media
 *
 * Le nom de colonne est conservé volontairement afin de rester
 * compatible avec la base existante.
 */

const MAX_STORIES = 8;
const MAX_AI_VARIANTS = 4;

const ALLOWED_IMAGE = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_VIDEO = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function uid() {
  return typeof crypto !== "undefined" &&
    "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function currentSeason(): string {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) {
    return "printemps";
  }

  if (month >= 6 && month <= 8) {
    return "été";
  }

  if (month >= 9 && month <= 11) {
    return "automne";
  }

  return "hiver";
}

function toLocalInput(iso?: string | null): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const local = new Date(
    date.getTime() - offset * 60000,
  );

  return local.toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

function removeStorageFile(url: string) {
  const marker = "/boutique-media/";
  const index = url.indexOf(marker);

  if (index === -1) {
    return;
  }

  const path = decodeURIComponent(
    url
      .slice(index + marker.length)
      .split("?")[0],
  );

  if (!path) {
    return;
  }

  supabase.storage
    .from("boutique-media")
    .remove([path])
    .catch(() => {
      // La suppression du fichier Storage ne doit pas
      // empêcher la mise à jour de la Story.
    });
}

/* -------------------------------------------------------------------------- */
/* Sortable Story                                                             */
/* -------------------------------------------------------------------------- */

function SortableStory({
  story,
  index,
  onPatch,
  onRemove,
}: {
  story: Story;
  index: number;
  onPatch: (
    id: string,
    patch: Partial<Story>,
  ) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: story.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  const enabled = story.enabled !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted/30"
    >
      <div className="relative aspect-[3/4] bg-muted">
        {story.kind === "video" ? (
          <video
            src={story.url}
            muted
            loop
            playsInline
            autoPlay
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={story.url}
            alt={story.label ?? "Story"}
            className="h-full w-full object-cover"
          />
        )}

        <Badge className="absolute left-1.5 top-1.5 gap-1 border-0 bg-black/60 text-[10px] text-white">
          {story.kind === "video" ? (
            <Video className="h-3 w-3" />
          ) : (
            <ImageIcon className="h-3 w-3" />
          )}

          {index + 1}
        </Badge>

        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Réordonner la Story"
          className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 cursor-grab touch-none items-center justify-center rounded bg-black/60 text-white active:cursor-grabbing"
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
          <Label className="text-[11px] text-muted-foreground">
            Active
          </Label>

          <Switch
            checked={enabled}
            onCheckedChange={(value) =>
              onPatch(story.id, {
                enabled: value,
              })
            }
          />
        </div>

        <Input
          value={story.label ?? ""}
          onChange={(event) =>
            onPatch(story.id, {
              label: event.target.value,
            })
          }
          placeholder="Titre (optionnel)"
          className="h-7 text-xs"
        />

        <Input
          value={story.cta_url ?? ""}
          onChange={(event) =>
            onPatch(story.id, {
              cta_url: event.target.value,
            })
          }
          placeholder="Lien CTA (optionnel)"
          className="h-7 text-xs"
        />

        <div className="grid grid-cols-2 gap-1">
          <div className="space-y-0.5">
            <Label className="text-[10px] text-muted-foreground">
              Début
            </Label>

            <Input
              type="datetime-local"
              value={toLocalInput(story.starts_at)}
              onChange={(event) =>
                onPatch(story.id, {
                  starts_at: fromLocalInput(
                    event.target.value,
                  ),
                })
              }
              className="h-7 px-1 text-[11px]"
            />
          </div>

          <div className="space-y-0.5">
            <Label className="text-[10px] text-muted-foreground">
              Fin
            </Label>

            <Input
              type="datetime-local"
              value={toLocalInput(story.ends_at)}
              onChange={(event) =>
                onPatch(story.id, {
                  ends_at: fromLocalInput(
                    event.target.value,
                  ),
                })
              }
              className="h-7 px-1 text-[11px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(story.id)}
            aria-label="Supprimer la Story"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stories Manager                                                            */
/* -------------------------------------------------------------------------- */

export function StoriesManager({
  boutiqueId,
}: {
  boutiqueId: string;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftCta, setDraftCta] = useState("");

  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiCount, setAiCount] = useState(4);

  const [variantPicker, setVariantPicker] = useState<{
    urls: string[];
    selected: Set<string>;
    label: string;
    cta?: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter:
        sortableKeyboardCoordinates,
    }),
  );

  /* ------------------------------------------------------------------------ */
  /* Boutique                                                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data: boutique,
    isLoading,
  } = useQuery({
    queryKey: [
      "boutique-highlights",
      boutiqueId,
    ],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .select(
          `
            id,
            name,
            category,
            description,
            tagline,
            target_markets,
            highlight_media
          `,
        )
        .eq("id", boutiqueId)
        .single();

      if (error) {
        throw error;
      }

      return data as any;
    },
  });

  const stories: Story[] = useMemo(
    () =>
      Array.isArray(boutique?.highlight_media)
        ? boutique.highlight_media
        : [],
    [boutique],
  );

  /* ------------------------------------------------------------------------ */
  /* Save                                                                     */
  /* ------------------------------------------------------------------------ */

  const saveMutation = useMutation({
    mutationFn: async (next: Story[]) => {
      const { error } = await supabase
        .from("boutiques")
        .update({
          highlight_media: next as any,
        })
        .eq("id", boutiqueId);

      if (error) {
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "boutique-highlights",
          boutiqueId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["store-boutiques"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.message ??
          "Erreur lors de l'enregistrement",
      );
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Add                                                                      */
  /* ------------------------------------------------------------------------ */

  const addStory = (story: Story) => {
    if (stories.length >= MAX_STORIES) {
      toast.error(
        `Limite de ${MAX_STORIES} Stories atteinte.`,
      );
      return;
    }

    saveMutation.mutate([
      ...stories,
      {
        enabled: true,
        ...story,
      },
    ]);
  };

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  const updateStory = (
    id: string,
    patch: Partial<Story>,
  ) => {
    saveMutation.mutate(
      stories.map((story) =>
        story.id === id
          ? {
              ...story,
              ...patch,
            }
          : story,
      ),
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Remove                                                                   */
  /* ------------------------------------------------------------------------ */

  const removeStory = (id: string) => {
    const target = stories.find(
      (story) => story.id === id,
    );

    saveMutation.mutate(
      stories.filter(
        (story) => story.id !== id,
      ),
    );

    if (target) {
      removeStorageFile(target.url);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Drag & drop                                                              */
  /* ------------------------------------------------------------------------ */

  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over,
    } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = stories.findIndex(
      (story) => story.id === active.id,
    );

    const newIndex = stories.findIndex(
      (story) => story.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    saveMutation.mutate(
      arrayMove(
        stories,
        oldIndex,
        newIndex,
      ),
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Upload                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleFile = async (file: File) => {
    if (!user) {
      toast.error("Session expirée");
      return;
    }

    const isImage = ALLOWED_IMAGE.includes(
      file.type,
    );

    const isVideo = ALLOWED_VIDEO.includes(
      file.type,
    );

    if (!isImage && !isVideo) {
      toast.error("Format non supporté.");
      return;
    }

    const maxBytes = isImage
      ? MAX_IMAGE_BYTES
      : MAX_VIDEO_BYTES;

    if (file.size > maxBytes) {
      toast.error(
        `Fichier trop volumineux (max ${(maxBytes / 1024 / 1024).toFixed(0)} Mo).`,
      );
      return;
    }

    if (stories.length >= MAX_STORIES) {
      toast.error(
        `Limite de ${MAX_STORIES} Stories atteinte.`,
      );
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop() ||
        (isImage ? "jpg" : "mp4");

      const path =
        `highlights/${user.id}/${boutiqueId}_${Date.now()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("boutique-media")
        .upload(
          path,
          file,
          {
            upsert: false,
            cacheControl: "3600",
            contentType: file.type,
          },
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicData,
      } = supabase.storage
        .from("boutique-media")
        .getPublicUrl(path);

      addStory({
        id: uid(),
        kind: isImage
          ? "image"
          : "video",
        url: publicData.publicUrl,
        label:
          draftLabel.trim() ||
          undefined,
        cta_url:
          draftCta.trim() ||
          undefined,
        enabled: true,
      });

      setDraftLabel("");
      setDraftCta("");

      toast.success(
        "Story ajoutée",
      );
    } catch (error: any) {
      toast.error(
        error?.message ??
          "Échec de l'upload",
      );
    } finally {
      setUploading(false);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  /* ------------------------------------------------------------------------ */
  /* AI generation                                                            */
  /* ------------------------------------------------------------------------ */

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Session expirée");
      return;
    }

    const userPrompt =
      aiPrompt.trim();

    if (userPrompt.length < 4) {
      toast.error(
        "Décris ton actualité (ex: soldes été, nouvelle collection capsule)",
      );
      return;
    }

    if (stories.length >= MAX_STORIES) {
      toast.error(
        `Limite de ${MAX_STORIES} Stories atteinte.`,
      );
      return;
    }

    const contextParts = [
      boutique?.name &&
        `Boutique: ${boutique.name}`,

      boutique?.category &&
        `Catégorie: ${boutique.category}`,

      Array.isArray(
        boutique?.target_markets,
      ) &&
        boutique.target_markets.length
        ? `Marché: ${boutique.target_markets.join(", ")}`
        : null,

      boutique?.tagline &&
        `Positionnement: ${boutique.tagline}`,

      `Saison: ${currentSeason()} ${new Date().getFullYear()}`,

      `Actualité: ${userPrompt}`,
    ].filter(Boolean);

    const enrichedPrompt =
      contextParts.join(" · ");

    const remaining =
      MAX_STORIES -
      stories.length;

    const wanted = Math.min(
      Math.max(aiCount, 1),
      MAX_AI_VARIANTS,
      remaining,
    );

    setGenerating(true);

    try {
      const {
        data,
        error,
      } = await supabase.functions.invoke(
        "studio-image-gen",
        {
          body: {
            boutique_id: boutiqueId,
            prompt: enrichedPrompt,
            count: wanted,
          },
        },
      );

      if (error) {
        throw error;
      }

      const urls =
        (
          data as {
            urls?: string[];
            url?: string;
          }
        )?.urls ??
        (
          data as {
            url?: string;
          }
        )?.url
          ? [
              (
                data as {
                  url: string;
                }
              ).url,
            ]
          : [];

      if (urls.length === 0) {
        throw new Error(
          "Génération échouée",
        );
      }

      const baseLabel =
        draftLabel.trim() ||
        userPrompt.slice(0, 40);

      setVariantPicker({
        urls,
        selected:
          new Set<string>(
            urls.length === 1
              ? urls
              : [],
          ),
        label: baseLabel,
        cta:
          draftCta.trim() ||
          undefined,
      });
    } catch (error: any) {
      toast.error(
        error?.message ??
          "Erreur de génération",
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Confirm AI variants                                                      */
  /* ------------------------------------------------------------------------ */

  const confirmVariantPick = () => {
    if (!variantPicker) {
      return;
    }

    const chosen =
      variantPicker.urls.filter(
        (url) =>
          variantPicker.selected.has(
            url,
          ),
      );

    if (chosen.length === 0) {
      toast.error(
        "Sélectionnez au moins une variante",
      );
      return;
    }

    const next = [...stories];

    const remaining =
      MAX_STORIES -
      next.length;

    chosen
      .slice(0, remaining)
      .forEach((url, index) => {
        next.push({
          id: uid(),
          kind: "image",
          url,

          label:
            chosen.length > 1
              ? `${variantPicker.label} (${index + 1})`
              : variantPicker.label,

          cta_url:
            variantPicker.cta,

          enabled: true,
        });
      });

    const discarded =
      variantPicker.urls.filter(
        (url) =>
          !variantPicker.selected.has(
            url,
          ),
      );

    discarded.forEach(
      removeStorageFile,
    );

    saveMutation.mutate(next);

    setVariantPicker(null);
    setAiPrompt("");
    setDraftLabel("");
    setDraftCta("");

    toast.success(
      `${chosen.length} visuel${
        chosen.length > 1
          ? "s"
          : ""
      } ajouté${
        chosen.length > 1
          ? "s"
          : ""
      }`,
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Cancel AI variants                                                       */
  /* ------------------------------------------------------------------------ */

  const cancelVariantPick = () => {
    if (!variantPicker) {
      return;
    }

    variantPicker.urls.forEach(
      removeStorageFile,
    );

    setVariantPicker(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Stories du Store
        </CardTitle>

        <CardDescription>
          Ajoutez de 1 à {MAX_STORIES} visuels ou
          vidéos pour enrichir la présentation de
          votre boutique sur le Store. Activez,
          programmez et réordonnez vos Stories.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {stories.length > 0 && (
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
                  items={stories.map(
                    (story) =>
                      story.id,
                  )}
                  strategy={
                    verticalListSortingStrategy
                  }
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {stories.map(
                      (
                        story,
                        index,
                      ) => (
                        <SortableStory
                          key={
                            story.id
                          }
                          story={
                            story
                          }
                          index={
                            index
                          }
                          onPatch={
                            updateStory
                          }
                          onRemove={
                            removeStory
                          }
                        />
                      ),
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {stories.length <
              MAX_STORIES && (
              <div className="space-y-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="story-label"
                      className="text-xs"
                    >
                      Titre
                      (optionnel)
                    </Label>

                    <Input
                      id="story-label"
                      value={
                        draftLabel
                      }
                      onChange={(
                        event,
                      ) =>
                        setDraftLabel(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Ex : Nouvelle collection automne"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="story-cta"
                      className="text-xs"
                    >
                      Lien CTA
                      (optionnel)
                    </Label>

                    <Input
                      id="story-cta"
                      value={
                        draftCta
                      }
                      onChange={(
                        event,
                      ) =>
                        setDraftCta(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="https://… ou /produit/…"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept={[
                    ...ALLOWED_IMAGE,
                    ...ALLOWED_VIDEO,
                  ].join(",")}
                  hidden
                  onChange={(
                    event,
                  ) => {
                    const file =
                      event
                        .target
                        .files?.[0];

                    if (file) {
                      handleFile(
                        file,
                      );
                    }
                  }}
                />

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      fileRef.current?.click()
                    }
                    disabled={
                      uploading ||
                      generating ||
                      saveMutation.isPending
                    }
                  >
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}

                    Uploader image /
                    vidéo
                  </Button>

                  <div className="flex gap-2">
                    <Input
                      value={
                        aiPrompt
                      }
                      onChange={(
                        event,
                      ) =>
                        setAiPrompt(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Actualité (promo, nouveauté…)"
                      className="h-9 text-sm"
                      disabled={
                        generating
                      }
                    />

                    <Input
                      type="number"
                      min={1}
                      max={Math.min(
                        MAX_AI_VARIANTS,
                        Math.max(
                          1,
                          MAX_STORIES -
                            stories.length,
                        ),
                      )}
                      value={aiCount}
                      onChange={(
                        event,
                      ) =>
                        setAiCount(
                          Math.max(
                            1,
                            Math.min(
                              MAX_AI_VARIANTS,
                              MAX_STORIES -
                                stories.length,
                              Number(
                                event
                                  .target
                                  .value,
                              ) || 1,
                            ),
                          ),
                        )
                      }
                      className="h-9 w-14 text-sm"
                      disabled={
                        generating
                      }
                      title="Nombre de variantes à générer"
                    />

                    <Button
                      type="button"
                      onClick={
                        handleGenerate
                      }
                      disabled={
                        generating ||
                        uploading ||
                        saveMutation.isPending
                      }
                      title={`Générer ${aiCount} variante(s)`}
                    >
                      {generating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <CalendarClock className="mt-0.5 h-3 w-3 shrink-0" />

                  L'IA s'appuie sur votre identité
                  (palette, ambiance, mots-clés),
                  votre catégorie (
                  {boutique?.category ?? "—"}
                  ), votre marché et la saison (
                  {currentSeason()}
                  ). Jusqu'à 4 variantes — vous
                  choisissez celle(s) à conserver.
                  Image ≤ 6 Mo · Vidéo ≤ 30 Mo.
                </p>
              </div>
            )}

            {stories.length > 0 && (
              <a
                href="/store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Voir le rendu sur le Store
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </>
        )}
      </CardContent>

      {/* ------------------------------------------------------------------ */}
      {/* AI variant picker                                                  */}
      {/* ------------------------------------------------------------------ */}

      <Dialog
        open={!!variantPicker}
        onOpenChange={(open) => {
          if (!open) {
            cancelVariantPick();
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Choisir vos variantes
            </DialogTitle>

            <DialogDescription>
              Sélectionnez les visuels à conserver.
              Les variantes non retenues seront
              supprimées.
            </DialogDescription>
          </DialogHeader>

          {variantPicker && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {variantPicker.urls.map(
                (url, index) => {
                  const isSelected =
                    variantPicker.selected.has(
                      url,
                    );

                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => {
                        const next =
                          new Set(
                            variantPicker.selected,
                          );

                        if (
                          next.has(
                            url,
                          )
                        ) {
                          next.delete(
                            url,
                          );
                        } else {
                          next.add(
                            url,
                          );
                        }

                        setVariantPicker({
                          ...variantPicker,
                          selected:
                            next,
                        });
                      }}
                      className={`group relative aspect-[4/5] overflow-hidden rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border/60 hover:border-primary/40"
                      }`}
                      aria-pressed={
                        isSelected
                      }
                    >
                      <img
                        src={url}
                        alt={`Variante ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute left-1.5 top-1.5">
                        <Badge
                          variant={
                            isSelected
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {isSelected
                            ? "✓ Sélectionnée"
                            : `Variante ${
                                index + 1
                              }`}
                        </Badge>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={
                cancelVariantPick
              }
            >
              Tout rejeter
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                variantPicker &&
                setVariantPicker({
                  ...variantPicker,
                  selected:
                    new Set(
                      variantPicker.urls,
                    ),
                })
              }
            >
              Tout sélectionner
            </Button>

            <Button
              onClick={
                confirmVariantPick
              }
              disabled={
                !variantPicker?.selected
                  .size
              }
            >
              Ajouter (
              {variantPicker?.selected
                .size ?? 0}
              )
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
