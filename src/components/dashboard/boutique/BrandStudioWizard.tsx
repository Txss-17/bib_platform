import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type StudioAnswers,
  useGenerateBrandDNA,
} from "@/hooks/useBrandStudio";

interface Props {
  boutiqueId: string;
  category?: string;
  onComplete?: () => void;
}

const AMBIANCES = [
  "Minimaliste & épuré",
  "Éditorial premium",
  "Audacieux & coloré",
  "Naturel & artisanal",
  "Tech futuriste",
  "Vintage chic",
];

const TONES = [
  "Sophistiqué",
  "Complice",
  "Expert",
  "Inspirant",
  "Direct",
  "Poétique",
];

const VALUES = [
  "Durabilité",
  "Made in France",
  "Innovation",
  "Artisanat",
  "Inclusivité",
  "Transparence",
  "Performance",
  "Bien-être",
];

export function BrandStudioWizard({
  boutiqueId,
  category,
  onComplete,
}: Props) {
  const [step, setStep] = useState(0);

  const [answers, setAnswers] =
    useState<StudioAnswers>({
      audience: "",
      ambiance: "",
      tone: "",
      values: [],
      inspiration: "",
      category,
    });

  const generate =
    useGenerateBrandDNA();

  const totalSteps = 5;
  const progress =
    ((step + 1) / totalSteps) * 100;

  const canNext = () => {
    if (step === 0) {
      return (
        answers.audience.trim().length >= 10
      );
    }

    if (step === 1) {
      return !!answers.ambiance;
    }

    if (step === 2) {
      return !!answers.tone;
    }

    if (step === 3) {
      return answers.values.length >= 1;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      await generate.mutateAsync({
        boutiqueId,
        answers,
      });

      toast.success(
        "Identité de marque générée ✨",
      );

      onComplete?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur de génération",
      );
    }
  };

  const toggleValue = (value: string) => {
    setAnswers((current) => ({
      ...current,
      values: current.values.includes(value)
        ? current.values.filter(
            (item) => item !== value,
          )
        : current.values.length < 4
          ? [...current.values, value]
          : current.values,
    }));
  };

  const goPrevious = () => {
    if (generate.isPending) {
      return;
    }

    setStep((current) =>
      Math.max(0, current - 1),
    );
  };

  const goNext = () => {
    if (!canNext()) {
      return;
    }

    setStep((current) =>
      Math.min(
        totalSteps - 1,
        current + 1,
      ),
    );
  };

  return (
    <Card className="mx-auto w-full max-w-2xl overflow-hidden border-secondary/20 bg-gradient-to-br from-card to-muted/20 p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-secondary" />

          <span className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
            Brand Studio · IA
          </span>
        </div>

        <div className="space-y-1.5">
          <h2 className="font-display text-xl leading-tight text-foreground sm:text-2xl md:text-3xl">
            Composons votre identité unique
          </h2>

          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            5 questions. L'IA générera ensuite
            palette, typographie, ton et premières
            scènes — différents pour chaque marque.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 space-y-2 sm:mt-8">
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-secondary transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground sm:text-xs">
          <span>
            Étape {step + 1} / {totalSteps}
          </span>

          <span>
            {Math.round(progress)} %
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="mt-7 min-h-[280px] sm:mt-8 sm:min-h-[300px]">
        {/* Step 0 — audience */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-display text-base sm:text-lg">
                À qui parlez-vous ?
              </Label>

              <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                Décrivez votre client idéal en
                1–2 phrases.
              </p>
            </div>

            <Textarea
              placeholder="Ex : Femmes urbaines 28-40 ans, exigeantes sur la qualité, sensibles à la durabilité…"
              value={answers.audience}
              onChange={(event) =>
                setAnswers({
                  ...answers,
                  audience:
                    event.target.value,
                })
              }
              rows={5}
              className="min-h-[140px] resize-none text-sm leading-6"
            />

            <p className="text-[11px] leading-4 text-muted-foreground">
              Minimum 10 caractères.
            </p>
          </div>
        )}

        {/* Step 1 — ambiance */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-display text-base sm:text-lg">
                Quelle ambiance visuelle ?
              </Label>

              <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                Choisissez la sensation dominante.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {AMBIANCES.map((ambiance) => {
                const selected =
                  answers.ambiance === ambiance;

                return (
                  <button
                    key={ambiance}
                    type="button"
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        ambiance,
                      })
                    }
                    aria-pressed={selected}
                    className={[
                      "flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border-2 p-4 text-left transition-all",
                      "touch-manipulation active:scale-[0.99]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected
                        ? "border-secondary bg-secondary/10"
                        : "border-border bg-background/40 hover:border-secondary/40 hover:bg-secondary/5",
                    ].join(" ")}
                  >
                    <span className="min-w-0 text-sm font-medium leading-5">
                      {ambiance}
                    </span>

                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-secondary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — tone */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-display text-base sm:text-lg">
                Quel ton de voix ?
              </Label>

              <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                Comment votre marque
                s'adresse-t-elle à ses clients ?
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TONES.map((tone) => {
                const selected =
                  answers.tone === tone;

                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        tone,
                      })
                    }
                    aria-pressed={selected}
                    className="touch-manipulation rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Badge
                      variant={
                        selected
                          ? "default"
                          : "outline"
                      }
                      className={[
                        "min-h-10 cursor-pointer px-4 py-2 text-sm",
                        selected
                          ? ""
                          : "hover:border-secondary/50 hover:bg-secondary/5",
                      ].join(" ")}
                    >
                      {tone}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — values */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-display text-base sm:text-lg">
                Vos valeurs cardinales
              </Label>

              <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                Sélectionnez 1 à 4 valeurs qui vous
                définissent.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {VALUES.map((value) => {
                const selected =
                  answers.values.includes(value);

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      toggleValue(value)
                    }
                    aria-pressed={selected}
                    className="touch-manipulation rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Badge
                      variant={
                        selected
                          ? "default"
                          : "outline"
                      }
                      className={[
                        "min-h-10 cursor-pointer px-3 py-2 text-sm",
                        selected
                          ? ""
                          : "hover:border-secondary/50 hover:bg-secondary/5",
                      ].join(" ")}
                    >
                      {value}
                    </Badge>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground sm:text-xs">
              <span>
                {answers.values.length}/4
                sélectionnées
              </span>

              {answers.values.length >= 4 && (
                <span>
                  Maximum atteint
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step 4 — inspiration */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-display text-base sm:text-lg">
                Une marque qui vous inspire ?
                <span className="ml-1 text-xs font-normal opacity-60">
                  (optionnel)
                </span>
              </Label>

              <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                Donnez un repère stylistique à
                l'IA. Vous pouvez écrire un nom,
                décrire un style ou laisser vide.
              </p>
            </div>

            <Input
              placeholder="Ex : Aesop, ma boulangerie de quartier, style scandinave minimal…"
              value={answers.inspiration}
              onChange={(event) =>
                setAnswers({
                  ...answers,
                  inspiration:
                    event.target.value,
                })
              }
              className="h-11 text-sm"
            />

            <button
              type="button"
              onClick={() =>
                setAnswers({
                  ...answers,
                  inspiration:
                    "Surprenez-moi",
                })
              }
              className="inline-flex min-h-10 items-center rounded-md text-xs font-medium text-secondary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              ✨ Surprenez-moi
            </button>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
              L'inspiration reste facultative :
              l'IA générera une identité unique
              même sans référence.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={goPrevious}
          disabled={
            step === 0 ||
            generate.isPending
          }
          className="min-h-11 w-full justify-center sm:w-auto"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour
        </Button>

        <span className="hidden text-center text-xs text-muted-foreground sm:block">
          Étape {step + 1} / {totalSteps}
        </span>

        {step < totalSteps - 1 ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={!canNext()}
            className="min-h-11 w-full justify-center sm:w-auto"
          >
            Continuer
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              !canNext() ||
              generate.isPending
            }
            className="min-h-11 w-full justify-center bg-secondary text-secondary-foreground hover:bg-secondary/90 sm:w-auto"
          >
            {generate.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Génération…
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-4 w-4" />
                Générer mon identité
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
