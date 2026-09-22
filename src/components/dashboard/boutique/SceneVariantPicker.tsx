import { useMemo } from "react";
import {
  Check,
  ChevronRight,
  LayoutGrid,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  findSceneDefinition,
  type SceneDefinition,
} from "@/lib/studioScenes";

export type SceneVariantPickerDevice =
  | "desktop"
  | "tablet"
  | "mobile";

export interface SceneVariantPickerProps {
  sceneType: string;
  value?: string | null;
  onChange: (variant: string) => void;
  className?: string;
  disabled?: boolean;
  device?: SceneVariantPickerDevice;
  showDescription?: boolean;
  compact?: boolean;
}

function getVariantName(
  definition: SceneDefinition,
  variant: string,
): string {
  return variant
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getVariantDescription(
  definition: SceneDefinition,
  variant: string,
): string {
  const descriptions: Record<string, string> = {
    fullscreen: "Composition immersive plein écran.",
    split: "Composition divisée entre visuel et contenu.",
    "type-only": "Composition typographique sans visuel principal.",
    product: "Composition centrée sur un produit.",

    alternating: "Contenu alterné entre texte et image.",
    centered: "Composition centrée et éditoriale.",
    "side-pinned": "Contenu latéral avec élément visuel persistant.",

    asymmetric: "Grille éditoriale asymétrique.",
    tiled: "Grille régulière en tuiles.",
    zigzag: "Composition alternée en diagonale.",

    "3-up": "Trois éléments mis en avant.",
    "4-up": "Quatre éléments présentés en grille.",
    carousel: "Présentation horizontale défilante.",

    "press-first": "La preuve presse est prioritaire.",
    "reviews-first": "Les avis clients sont prioritaires.",
    "badges-row": "Les garanties sont présentées en ligne.",

    "split-newsletter": "CTA partagé avec capture newsletter.",
    "sticky-only": "CTA compact avec priorité à l'action.",

    accordion: "Questions développables une par une.",
    "two-column": "Contenu réparti en deux colonnes.",
    list: "Présentation verticale simple et lisible.",

    "split-image": "Composition avec image et contenu.",
    minimal: "Version réduite et très épurée.",

    scrolling: "Contenu horizontal animé.",
    "static-grid": "Éléments présentés dans une grille fixe.",

    letter: "Format lettre éditoriale.",
    "portrait-left": "Portrait à gauche, contenu à droite.",
    "portrait-right": "Portrait à droite, contenu à gauche.",

    xl: "Typographie monumentale.",
    stacked: "Statement organisé en plusieurs niveaux.",
    marquee: "Message typographique continu.",

    dark: "Version à contraste élevé.",
    light: "Version claire et discrète.",
    accent: "Version utilisant la couleur d'accent.",
    outline: "Version avec traitement contour.",

    mosaic: "Mosaïque de visuels aux formats variés.",
    uniform: "Grille visuelle régulière.",
    masonry: "Grille de type masonry.",

    "image-left": "Visuel à gauche et contenu à droite.",
    "image-right": "Contenu à gauche et visuel à droite.",
    "image-top": "Visuel placé au-dessus du contenu.",

    compact: "Présentation compacte.",
    featured: "Un élément principal est mis en avant.",
    full: "Présentation complète du contenu.",

    "2-cols": "Deux colonnes de contenu.",
    "3-cols": "Trois colonnes de contenu.",
    "4-cols": "Quatre colonnes de contenu.",

    horizontal: "Parcours présenté horizontalement.",
    vertical: "Parcours présenté verticalement.",

    "split-tall":
      "Composition verticale avec visuel dominant.",
  };

  return (
    descriptions[variant] ??
    `Variante « ${getVariantName(definition, variant)} ».`
  );
}

function PreviewWireframe({
  definition,
  variant,
  selected,
}: {
  definition: SceneDefinition;
  variant: string;
  selected: boolean;
}) {
  const role = definition.role;

  const isSplit =
    variant.includes("split") ||
    variant.includes("left") ||
    variant.includes("right") ||
    variant.includes("columns");

  const isGrid =
    variant.includes("3-up") ||
    variant.includes("4-up") ||
    variant.includes("grid") ||
    variant === "mosaic" ||
    variant === "masonry";

  const isCentered =
    variant === "centered" ||
    variant === "type-only" ||
    variant === "minimal" ||
    variant === "xl" ||
    variant === "stacked";

  const isHero =
    role === "hero" ||
    definition.id === "product-hero";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-lg border bg-muted/30",
        selected && "border-primary/40",
      )}
    >
      {/* Browser / canvas header */}
      <div className="absolute inset-x-0 top-0 h-2 border-b bg-background/90" />

      {isHero ? (
        <div className="absolute inset-0 flex items-end p-3">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br from-foreground/10 via-muted to-background",
              variant === "fullscreen" && "from-foreground/25",
            )}
          />

          <div
            className={cn(
              "relative z-10 w-2/3 space-y-1.5",
              isCentered && "mx-auto text-center",
            )}
          >
            <div className="h-1.5 w-1/3 rounded-full bg-foreground/25" />

            <div className="h-3 w-5/6 rounded bg-foreground/50" />

            <div className="h-1.5 w-4/6 rounded-full bg-foreground/20" />

            <div className="mt-2 h-3.5 w-16 rounded-full bg-foreground/60" />
          </div>
        </div>
      ) : isGrid ? (
        <div className="absolute inset-0 grid grid-cols-3 gap-1.5 p-3 pt-5">
          {Array.from({
            length: variant.includes("4-up") ? 4 : 6,
          }).map((_, index) => (
            <div
              key={index}
              className="rounded-md bg-foreground/10"
            />
          ))}
        </div>
      ) : isSplit ? (
        <div className="absolute inset-0 flex gap-1.5 p-3 pt-5">
          <div
            className={cn(
              "flex-1 rounded-md bg-foreground/10",
              variant.includes("right") && "order-2",
            )}
          />

          <div className="flex flex-1 flex-col justify-center gap-1.5 px-1">
            <div className="h-1.5 w-1/3 rounded-full bg-foreground/20" />

            <div className="h-2.5 w-5/6 rounded bg-foreground/40" />

            <div className="h-1.5 w-4/6 rounded-full bg-foreground/20" />

            <div className="h-3 w-14 rounded-full bg-foreground/35" />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-center gap-2 p-5 pt-7">
          <div
            className={cn(
              "h-1.5 w-1/4 rounded-full bg-foreground/20",
              isCentered && "mx-auto",
            )}
          />

          <div
            className={cn(
              "h-3 w-4/5 rounded bg-foreground/40",
              isCentered && "mx-auto",
            )}
          />

          <div
            className={cn(
              "h-1.5 w-3/5 rounded-full bg-foreground/20",
              isCentered && "mx-auto",
            )}
          />

          <div
            className={cn(
              "mt-2 h-10 rounded-md border border-dashed border-foreground/15 bg-foreground/5",
              role === "gallery" &&
                "grid grid-cols-4 gap-1",
            )}
          />
        </div>
      )}

      <div className="absolute bottom-1.5 right-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
        {variant}
      </div>
    </div>
  );
}

function DeviceIcon({
  device,
}: {
  device: SceneVariantPickerDevice;
}) {
  if (device === "mobile") {
    return <Smartphone className="h-3.5 w-3.5" />;
  }

  if (device === "tablet") {
    return <Tablet className="h-3.5 w-3.5" />;
  }

  return <Monitor className="h-3.5 w-3.5" />;
}

export function SceneVariantPicker({
  sceneType,
  value,
  onChange,
  className,
  disabled = false,
  device = "desktop",
  showDescription = true,
  compact = false,
}: SceneVariantPickerProps) {
  const definition = useMemo(
    () => findSceneDefinition(sceneType),
    [sceneType],
  );

  const variants = definition?.variants ?? [];

  const activeVariant =
    value && variants.includes(value)
      ? value
      : definition?.variants[0];

  if (!definition) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed p-4 text-sm text-muted-foreground",
          className,
        )}
      >
        Cette scène n'est plus disponible dans la
        bibliothèque BIB.
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed p-4 text-sm text-muted-foreground",
          className,
        )}
      >
        Cette scène ne possède aucune variante
        configurable.
      </div>
    );
  }

  return (
    <section
      aria-label={`Variantes de ${definition.name}`}
      className={cn("space-y-4", className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">
              Variante
            </h3>

            <Badge
              variant="secondary"
              className="font-normal"
            >
              {variants.length} option
              {variants.length > 1 ? "s" : ""}
            </Badge>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {definition.tagline}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-1 rounded-lg border bg-muted/30 p-1 sm:flex">
          <span className="px-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Aperçu
          </span>

          <DeviceIcon device={device} />
        </div>
      </div>

      {/* Variants */}
      <div
        className={cn(
          "grid gap-3",
          compact
            ? "grid-cols-1 sm:grid-cols-2"
            : variants.length <= 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
        )}
        role="radiogroup"
        aria-label="Choisir une variante"
      >
        {variants.map((variant) => {
          const selected = activeVariant === variant;

          return (
            <button
              key={variant}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(variant)}
              className={cn(
                "group relative min-w-0 rounded-xl border bg-card text-left transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm",
                selected &&
                  "border-primary bg-primary/[0.025] shadow-sm ring-1 ring-primary/20",
                disabled &&
                  "cursor-not-allowed opacity-50 hover:translate-y-0 hover:border-border hover:shadow-none",
              )}
            >
              <div className="p-2">
                <PreviewWireframe
                  definition={definition}
                  variant={variant}
                  selected={selected}
                />
              </div>

              <div className="px-3 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {getVariantName(
                      definition,
                      variant,
                    )}
                  </span>

                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background text-transparent",
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                </div>

                {showDescription && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {getVariantDescription(
                      definition,
                      variant,
                    )}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <span>
                    {selected
                      ? "Sélectionnée"
                      : "Choisir"}
                  </span>

                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Information */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <LayoutGrid className="h-3.5 w-3.5 shrink-0" />

        <span>
          La variante modifie la composition visuelle de
          la scène, sans supprimer son contenu.
        </span>
      </div>
    </section>
  );
}

export default SceneVariantPicker;
