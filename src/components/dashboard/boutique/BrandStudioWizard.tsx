import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type StudioAnswers,
  useGenerateBrandDNA,
} from "@/hooks/useBrandStudio";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  boutiqueId: string;
  category?: string;
  onComplete?: () => void;
}

const STEPS = [
  {
    title: "Les fondations",
    shortTitle: "Fondations",
    description: "Ce que votre marque fait réellement.",
  },
  {
    title: "Le client & la promesse",
    shortTitle: "Client",
    description: "Pour qui vous existez et pourquoi.",
  },
  {
    title: "Le territoire visuel",
    shortTitle: "Univers",
    description: "L'univers dans lequel votre marque doit évoluer.",
  },
  {
    title: "La personnalité & la voix",
    shortTitle: "Voix",
    description: "La manière dont votre marque pense et s'exprime.",
  },
  {
    title: "La direction",
    shortTitle: "Validation",
    description: "Votre brief final avant génération.",
  },
] as const;

const PERSONALITIES = [
  "Élégante",
  "Audacieuse",
  "Chaleureuse",
  "Minimaliste",
  "Créative",
  "Experte",
  "Naturelle",
  "Contemporaine",
  "Premium",
  "Accessible",
  "Artisanale",
  "Sophistiquée",
];

const VALUES = [
  "Qualité",
  "Durabilité",
  "Innovation",
  "Artisanat",
  "Transparence",
  "Inclusivité",
  "Savoir-faire",
  "Performance",
  "Bien-être",
  "Responsabilité",
  "Proximité",
  "Simplicité",
];

const VISUAL_TERRITORIES = [
  {
    value: "editorial",
    label: "Éditorial premium",
    description: "Sobre, sophistiqué, direction artistique forte.",
  },
  {
    value: "natural",
    label: "Naturel & organique",
    description: "Matières brutes, douceur, authenticité.",
  },
  {
    value: "minimal",
    label: "Minimal & architectural",
    description: "Clarté, espaces, formes précises.",
  },
  {
    value: "bold",
    label: "Audacieux & expressif",
    description: "Contrastes, caractère et impact visuel.",
  },
  {
    value: "craft",
    label: "Artisanal & humain",
    description: "Texture, geste, savoir-faire et proximité.",
  },
  {
    value: "future",
    label: "Contemporain & futuriste",
    description: "Innovation, précision et esthétique digitale.",
  },
] as const;

const MARKET_POSITIONING = [
  {
    value: "accessible" as const,
    label: "Accessible",
    description: "Une marque facile à adopter.",
  },
  {
    value: "milieu_de_gamme" as const,
    label: "Milieu de gamme",
    description: "Un équilibre entre valeur, qualité et accessibilité.",
  },
  {
    value: "premium" as const,
    label: "Premium",
    description: "Une expérience et une qualité supérieures.",
  },
  {
    value: "luxe" as const,
    label: "Luxe / exclusif",
    description: "Rareté, exigence et forte valeur perçue.",
  },
  {
    value: "expert" as const,
    label: "Expert / spécialisé",
    description: "Une marque choisie pour son expertise.",
  },
  {
    value: "niche" as const,
    label: "Niche",
    description: "Une proposition très ciblée pour un public spécifique.",
  },
] as const;

function createInitialAnswers(
  category?: string,
  boutiqueName?: string,
): StudioAnswers {
  return {
    brandName: boutiqueName ?? "",
    activity: "",
    offer: "",
    differentiation: "",
    story: "",

    idealCustomer: "",
    customerNeed: "",
    customerResult: "",
    marketPositioning: "a_definir",

    visualTerritory: "",
    materials: "",
    preferredColors: "",
    forbiddenColors: "",
    visualReferences: "",

    personality: [],
    brandValues: [],
    voice: "",
    wordsToAvoid: "",

    directionNote: "",
    confirmed: false,

    category,
    productType: "",
  };
}

function FieldHint({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      {children}
    </p>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        {eyebrow}
      </p>

      <h3 className="text-xl font-semibold leading-tight text-foreground sm:text-2xl">
        {title}
      </h3>

      <p className="text-sm leading-6 text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
}

export function BrandStudioWizard({
  boutiqueId,
  category,
  onComplete,
}: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<StudioAnswers>(() =>
    createInitialAnswers(category),
  );

  const generate = useGenerateBrandDNA();

  const { data: boutique } = useQuery({
    queryKey: ["brand-studio-boutique", boutiqueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .select("id, name, category")
        .eq("id", boutiqueId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!boutiqueId,
  });

  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const update = <K extends keyof StudioAnswers>(
    key: K,
    value: StudioAnswers[K],
  ) => {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleListValue = (
    key: "personality" | "brandValues",
    value: string,
    max = 4,
  ) => {
    setAnswers((current) => {
      const currentValues = current[key];

      if (currentValues.includes(value)) {
        return {
          ...current,
          [key]: currentValues.filter((item) => item !== value),
        };
      }

      if (currentValues.length >= max) {
        return current;
      }

      return {
        ...current,
        [key]: [...currentValues, value],
      };
    });
  };

  const canNext = useMemo(() => {
    if (step === 0) {
      return (
        answers.brandName.trim().length >= 2 &&
        answers.activity.trim().length >= 10 &&
        answers.offer.trim().length >= 10 &&
        answers.differentiation.trim().length >= 10
      );
    }

    if (step === 1) {
      return (
        answers.idealCustomer.trim().length >= 10 &&
        answers.customerNeed.trim().length >= 10 &&
        answers.customerResult.trim().length >= 10 &&
        answers.marketPositioning !== "a_definir"
      );
    }

    if (step === 2) {
      return answers.visualTerritory.trim().length > 0;
    }

    if (step === 3) {
      return (
        answers.personality.length >= 2 &&
        answers.brandValues.length >= 2 &&
        answers.voice.trim().length >= 10
      );
    }

    return answers.confirmed;
  }, [answers, step]);

  const goPrevious = () => {
    if (generate.isPending) {
      return;
    }

    setStep((current) => Math.max(0, current - 1));
  };

  const goNext = () => {
    if (!canNext || generate.isPending) {
      return;
    }

    setStep((current) =>
      Math.min(totalSteps - 1, current + 1),
    );
  };

  const handleSubmit = async () => {
    if (!answers.confirmed || generate.isPending) {
      return;
    }

    try {
      await generate.mutateAsync({
        boutiqueId,
        answers: {
          ...answers,
          category: answers.category || category,
          confirmed: true,
        },
      });

      toast.success(
        "Identité de marque générée et Studio initialisé.",
      );

      onComplete?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la génération de l'identité.",
      );
    }
  };

  const boutiqueName =
    answers.brandName ||
    boutique?.name ||
    "Votre marque";

  return (
    <Card className="w-full overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        <header className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Brand Studio · Direction de marque
              </p>

              <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl">
                Construisons une vraie direction de marque.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                L'IA ne va pas inventer votre marque à partir
                de quelques mots-clés. Elle va transformer
                vos choix en une identité cohérente,
                exploitable dans votre boutique.
              </p>
            </div>

            <Badge
              variant="secondary"
              className="w-fit shrink-0 px-3 py-1.5"
            >
              {boutiqueName}
            </Badge>
          </div>

          <div className="space-y-3">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Étape {step + 1} · {STEPS[step].title}
                </p>

                <p className="mt-0.5 hidden text-xs leading-5 text-muted-foreground sm:block">
                  {STEPS[step].description}
                </p>
              </div>

              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {step + 1}/{totalSteps}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {STEPS.map((item, index) => (
              <button
                key={item.shortTitle}
                type="button"
                onClick={() => {
                  if (
                    index < step &&
                    !generate.isPending
                  ) {
                    setStep(index);
                  }
                }}
                disabled={
                  index > step ||
                  generate.isPending
                }
                className={[
                  "min-w-0 rounded-lg px-1.5 py-2 text-center text-[10px] font-medium transition-colors sm:px-2 sm:text-xs",
                  index === step
                    ? "bg-secondary text-secondary-foreground"
                    : index < step
                      ? "bg-secondary/10 text-secondary hover:bg-secondary/20"
                      : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                <span className="block truncate">
                  {item.shortTitle}
                </span>
              </button>
            ))}
          </div>
        </header>

        <main className="mt-8 min-h-[420px] sm:mt-10">
          {step === 0 && (
            <div className="space-y-8">
              <SectionTitle
                eyebrow="01 · Fondations"
                title="Qu'est-ce que votre marque construit ?"
                description="On commence par les faits : activité, offre, différence et histoire. L'identité visuelle viendra ensuite."
              />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="brand-name">
                    Nom de la marque
                  </Label>

                  <Input
                    id="brand-name"
                    value={answers.brandName}
                    onChange={(event) =>
                      update(
                        "brandName",
                        event.target.value,
                      )
                    }
                    placeholder="Ex. Atelier Noma"
                    className="h-11"
                    autoComplete="organization"
                  />

                  <FieldHint>
                    Le nom de la boutique est prérempli lorsqu'il est disponible.
                  </FieldHint>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">
                    Activité
                  </Label>

                  <Textarea
                    id="activity"
                    value={answers.activity}
                    onChange={(event) =>
                      update(
                        "activity",
                        event.target.value,
                      )
                    }
                    placeholder="Que fait précisément la marque ?"
                    rows={5}
                    className="resize-none leading-6"
                  />

                  <FieldHint>
                    Décrivez concrètement votre activité.
                  </FieldHint>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offer">
                    Offre principale
                  </Label>

                  <Textarea
                    id="offer"
                    value={answers.offer}
                    onChange={(event) =>
                      update(
                        "offer",
                        event.target.value,
                      )
                    }
                    placeholder="Quels produits ou services proposez-vous ?"
                    rows={5}
                    className="resize-none leading-6"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="differentiation">
                    Ce qui vous distingue
                  </Label>

                  <Textarea
                    id="differentiation"
                    value={answers.differentiation}
                    onChange={(event) =>
                      update(
                        "differentiation",
                        event.target.value,
                      )
                    }
                    placeholder="Pourquoi un client vous choisirait plutôt qu'une autre marque ?"
                    rows={5}
                    className="resize-none leading-6"
                  />

                  <FieldHint>
                    Évitez les formules génériques. Décrivez votre différence réelle.
                  </FieldHint>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="story">
                    Origine / histoire{" "}
                    <span className="font-normal text-muted-foreground">
                      (facultatif)
                    </span>
                  </Label>

                  <Textarea
                    id="story"
                    value={answers.story ?? ""}
                    onChange={(event) =>
                      update(
                        "story",
                        event.target.value,
                      )
                    }
                    placeholder="Pourquoi cette marque existe-t-elle ?"
                    rows={4}
                    className="resize-none leading-6"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <SectionTitle
                eyebrow="02 · Client & promesse"
                title="Pour qui la marque existe-t-elle ?"
                description="L'objectif est de comprendre le contexte d'achat et le résultat recherché, pas seulement une tranche d'âge."
              />

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ideal-customer">
                    Client idéal
                  </Label>

                  <Textarea
                    id="ideal-customer"
                    value={answers.idealCustomer}
                    onChange={(event) =>
                      update(
                        "idealCustomer",
                        event.target.value,
                      )
                    }
                    placeholder="Qui achète réellement ? Dans quel contexte ? Qu'est-ce qui compte pour cette personne ?"
                    rows={5}
                    className="resize-none leading-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-need">
                    Besoin / problème
                  </Label>

                  <Textarea
                    id="customer-need"
                    value={answers.customerNeed}
                    onChange={(event) =>
                      update(
                        "customerNeed",
                        event.target.value,
                      )
                    }
                    placeholder="Quel besoin concret ou quelle frustration votre offre vient-elle résoudre ?"
                    rows={5}
                    className="resize-none leading-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-result">
                    Résultat recherché
                  </Label>

                  <Textarea
                    id="customer-result"
                    value={answers.customerResult}
                    onChange={(event) =>
                      update(
                        "customerResult",
                        event.target.value,
                      )
                    }
                    placeholder="Après l'achat, qu'est-ce que le client doit ressentir, obtenir ou pouvoir faire ?"
                    rows={5}
                    className="resize-none leading-6"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>
                      Positionnement perçu
                    </Label>

                    <FieldHint>
                      Choisissez l'intention de positionnement. L'IA affinera ensuite la direction.
                    </FieldHint>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {MARKET_POSITIONING.map((item) => {
                      const selected =
                        answers.marketPositioning ===
                        item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            update(
                              "marketPositioning",
                              item.value,
                            )
                          }
                          className={[
                            "min-h-28 rounded-2xl border-2 p-4 text-left transition-all",
                            "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            selected
                              ? "border-secondary bg-secondary/10"
                              : "border-border bg-background hover:border-secondary/40 hover:bg-secondary/5",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold">
                              {item.label}
                            </span>

                            {selected && (
                              <Check className="h-4 w-4 shrink-0 text-secondary" />
                            )}
                          </div>

                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <SectionTitle
                eyebrow="03 · Territoire visuel"
                title="Dans quel univers votre marque doit-elle vivre ?"
                description="Vous donnez une direction artistique. L'IA choisira ensuite les combinaisons précises de couleurs, typographies et matières."
              />

              <div className="space-y-7">
                <div className="space-y-3">
                  <div>
                    <Label>
                      Territoire dominant
                    </Label>

                    <FieldHint>
                      Choisissez l'univers qui se rapproche le plus de votre intention.
                    </FieldHint>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {VISUAL_TERRITORIES.map((item) => {
                      const selected =
                        answers.visualTerritory ===
                        item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            update(
                              "visualTerritory",
                              item.value,
                            )
                          }
                          className={[
                            "min-h-28 rounded-2xl border-2 p-4 text-left transition-all",
                            "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            selected
                              ? "border-secondary bg-secondary/10"
                              : "border-border bg-background hover:border-secondary/40 hover:bg-secondary/5",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold">
                              {item.label}
                            </span>

                            {selected && (
                              <Check className="h-4 w-4 shrink-0 text-secondary" />
                            )}
                          </div>

                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="materials">
                      Matières / textures
                    </Label>

                    <Textarea
                      id="materials"
                      value={answers.materials}
                      onChange={(event) =>
                        update(
                          "materials",
                          event.target.value,
                        )
                      }
                      placeholder="Bois clair, métal brossé, lin, verre, papier texturé…"
                      rows={4}
                      className="resize-none leading-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visual-references">
                      Références visuelles
                    </Label>

                    <Textarea
                      id="visual-references"
                      value={answers.visualReferences}
                      onChange={(event) =>
                        update(
                          "visualReferences",
                          event.target.value,
                        )
                      }
                      placeholder="Une marque, un lieu, une architecture, une époque, une photographie…"
                      rows={4}
                      className="resize-none leading-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred-colors">
                      Couleurs souhaitées
                    </Label>

                    <Input
                      id="preferred-colors"
                      value={answers.preferredColors}
                      onChange={(event) =>
                        update(
                          "preferredColors",
                          event.target.value,
                        )
                      }
                      placeholder="Ex. ivoire, vert profond, terracotta…"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forbidden-colors">
                      Couleurs à éviter
                    </Label>

                    <Input
                      id="forbidden-colors"
                      value={answers.forbiddenColors}
                      onChange={(event) =>
                        update(
                          "forbiddenColors",
                          event.target.value,
                        )
                      }
                      placeholder="Ex. rose vif, violet, néons…"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4 text-xs leading-5 text-muted-foreground">
                  <strong className="text-foreground">
                    Principe BIB :
                  </strong>{" "}
                  vous indiquez une direction. L'IA compose
                  ensuite une identité spécifique au brief,
                  plutôt que de recopier une palette ou un
                  modèle prédéfini.
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <SectionTitle
                eyebrow="04 · Personnalité & voix"
                title="Comment votre marque pense-t-elle et s'exprime-t-elle ?"
                description="Ces choix serviront au copywriting, aux scènes, aux CTA et aux contenus générés."
              />

              <div className="space-y-7">
                <div className="space-y-3">
                  <div>
                    <Label>
                      Traits de personnalité
                    </Label>

                    <FieldHint>
                      Sélectionnez 2 à 4 traits.
                    </FieldHint>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {PERSONALITIES.map((value) => {
                      const selected =
                        answers.personality.includes(
                          value,
                        );

                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            toggleListValue(
                              "personality",
                              value,
                            )
                          }
                          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <Badge
                            variant={
                              selected
                                ? "default"
                                : "outline"
                            }
                            className="min-h-10 cursor-pointer px-4 py-2 text-sm"
                          >
                            {value}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>
                      Valeurs prioritaires
                    </Label>

                    <FieldHint>
                      Sélectionnez 2 à 4 valeurs réellement incarnées par la marque.
                    </FieldHint>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {VALUES.map((value) => {
                      const selected =
                        answers.brandValues.includes(
                          value,
                        );

                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            toggleListValue(
                              "brandValues",
                              value,
                            )
                          }
                          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <Badge
                            variant={
                              selected
                                ? "default"
                                : "outline"
                            }
                            className="min-h-10 cursor-pointer px-4 py-2 text-sm"
                          >
                            {value}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice">
                    Décrivez la voix de la marque
                  </Label>

                  <Textarea
                    id="voice"
                    value={answers.voice}
                    onChange={(event) =>
                      update(
                        "voice",
                        event.target.value,
                      )
                    }
                    placeholder="Ex. Elle explique simplement sans être infantilisante, reste élégante mais jamais distante…"
                    rows={5}
                    className="resize-none leading-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="words-to-avoid">
                    Mots / expressions à éviter
                  </Label>

                  <Textarea
                    id="words-to-avoid"
                    value={answers.wordsToAvoid}
                    onChange={(event) =>
                      update(
                        "wordsToAvoid",
                        event.target.value,
                      )
                    }
                    placeholder="Ex. révolutionnaire, pas cher, luxe accessible…"
                    rows={4}
                    className="resize-none leading-6"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <SectionTitle
                eyebrow="05 · Direction de marque"
                title="Voici le brief que l'IA va transformer."
                description="Dernière étape : vous vérifiez la direction générale avant que BIB génère l'identité de marque."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="min-w-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Marque
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold">
                    {answers.brandName ||
                      "Nom non renseigné"}
                  </p>

                  <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                    {answers.activity ||
                      "Activité non renseignée"}
                  </p>
                </Card>

                <Card className="min-w-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Offre
                  </p>

                  <p className="mt-2 break-words text-sm leading-5 text-muted-foreground">
                    {answers.offer ||
                      "Offre non renseignée"}
                  </p>
                </Card>

                <Card className="min-w-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Différenciation
                  </p>

                  <p className="mt-2 break-words text-sm leading-5 text-muted-foreground">
                    {answers.differentiation ||
                      "Non renseignée"}
                  </p>
                </Card>

                <Card className="min-w-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Client
                  </p>

                  <p className="mt-2 break-words text-sm leading-5 text-muted-foreground">
                    {answers.idealCustomer ||
                      "Client idéal non renseigné"}
                  </p>
                </Card>

                <Card className="min-w-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Promesse
                  </p>

                  <p className="mt-2 break-words text-sm leading-5 text-muted-foreground">
                    {answers.customerResult ||
                      "Résultat non renseigné"}
                  </p>
                </Card>

                <Card className="min-w-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Positionnement
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {MARKET_POSITIONING.find(
                      (item) =>
                        item.value ===
                        answers.marketPositioning,
                    )?.label ??
                      "Non renseigné"}
                  </p>
                </Card>

                <Card className="min-w-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Univers visuel
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {VISUAL_TERRITORIES.find(
                      (item) =>
                        item.value ===
                        answers.visualTerritory,
                    )?.label ??
                      "Non renseigné"}
                  </p>

                  {answers.materials && (
                    <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                      {answers.materials}
                    </p>
                  )}
                </Card>

                <Card className="min-w-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Personnalité
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {answers.personality.map(
                      (value) => (
                        <Badge
                          key={value}
                          variant="secondary"
                        >
                          {value}
                        </Badge>
                      ),
                    )}
                  </div>
                </Card>

                <Card className="min-w-0 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Voix
                  </p>

                  <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
                    {answers.voice ||
                      "Voix non renseignée"}
                  </p>
                </Card>
              </div>

              <div className="space-y-4 rounded-2xl border border-secondary/30 bg-secondary/10 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />

                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      Prêt pour la génération
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      BIB va utiliser ce brief pour produire
                      l'ADN de marque, la palette, les
                      typographies, le ton rédactionnel, le
                      tagline, le hero, les CTA et la première
                      structure visuelle du Studio.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border bg-background/70 p-4">
                  <Checkbox
                    id="confirm-direction"
                    checked={answers.confirmed}
                    onCheckedChange={(checked) =>
                      update(
                        "confirmed",
                        checked === true,
                      )
                    }
                    className="mt-0.5"
                  />

                  <Label
                    htmlFor="confirm-direction"
                    className="cursor-pointer text-sm font-normal leading-6"
                  >
                    J'ai vérifié les informations ci-dessus
                    et je confirme cette direction pour la
                    génération de mon identité de marque.
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direction-note">
                    Dernière indication pour l'IA{" "}
                    <span className="font-normal text-muted-foreground">
                      (facultatif)
                    </span>
                  </Label>

                  <Textarea
                    id="direction-note"
                    value={answers.directionNote ?? ""}
                    onChange={(event) =>
                      update(
                        "directionNote",
                        event.target.value,
                      )
                    }
                    placeholder="Une contrainte ou une nuance importante à respecter avant la génération…"
                    rows={4}
                    className="resize-none bg-background leading-6"
                  />
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={goPrevious}
            disabled={
              step === 0 || generate.isPending
            }
            className="min-h-11 w-full sm:w-auto"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </Button>

          <p className="hidden text-center text-xs text-muted-foreground lg:block">
            Vos réponses restent modifiables jusqu'à la génération.
          </p>

          {step < totalSteps - 1 ? (
            <Button
              type="button"
              onClick={goNext}
              disabled={
                !canNext || generate.isPending
              }
              className="min-h-11 w-full sm:w-auto"
            >
              Continuer
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                generate.isPending ||
                !canNext
              }
              className="min-h-11 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 sm:w-auto"
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer mon identité
                </>
              )}
            </Button>
          )}
        </footer>
      </div>
    </Card>
  );
}
