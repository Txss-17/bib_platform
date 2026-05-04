import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { useGenerateBrandDNA, type StudioAnswers } from "@/hooks/useBrandStudio";
import { toast } from "sonner";

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

export function BrandStudioWizard({ boutiqueId, category, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<StudioAnswers>({
    audience: "",
    ambiance: "",
    tone: "",
    values: [],
    inspiration: "",
    category,
  });
  const generate = useGenerateBrandDNA();

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const canNext = () => {
    if (step === 0) return answers.audience.trim().length >= 10;
    if (step === 1) return !!answers.ambiance;
    if (step === 2) return !!answers.tone;
    if (step === 3) return answers.values.length >= 1;
    if (step === 4) return answers.inspiration.trim().length >= 5;
    return true;
  };

  const handleSubmit = async () => {
    try {
      await generate.mutateAsync({ boutiqueId, answers });
      toast.success("Identité de marque générée ✨");
      onComplete?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de génération");
    }
  };

  const toggleValue = (v: string) => {
    setAnswers((a) => ({
      ...a,
      values: a.values.includes(v)
        ? a.values.filter((x) => x !== v)
        : a.values.length < 4
          ? [...a.values, v]
          : a.values,
    }));
  };

  return (
    <Card className="p-6 sm:p-10 max-w-2xl mx-auto bg-gradient-to-br from-card to-muted/20 border-secondary/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-secondary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Brand Studio · IA
        </span>
      </div>
      <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-1">
        Composons votre identité unique
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        5 questions. L'IA générera ensuite palette, typo, ton et premières scènes — différents pour chaque marque.
      </p>

      {/* Progress */}
      <div className="h-1 bg-muted rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-secondary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step 0 — audience */}
      {step === 0 && (
        <div className="space-y-3">
          <Label className="text-base font-display">À qui parlez-vous ?</Label>
          <p className="text-xs text-muted-foreground">
            Décrivez votre client idéal en 1-2 phrases.
          </p>
          <Textarea
            placeholder="Ex : Femmes urbaines 28-40 ans, exigeantes sur la qualité, sensibles à la durabilité…"
            value={answers.audience}
            onChange={(e) => setAnswers({ ...answers, audience: e.target.value })}
            rows={4}
            className="resize-none"
          />
        </div>
      )}

      {/* Step 1 — ambiance */}
      {step === 1 && (
        <div className="space-y-3">
          <Label className="text-base font-display">Quelle ambiance visuelle ?</Label>
          <p className="text-xs text-muted-foreground">Choisissez la sensation dominante.</p>
          <div className="grid grid-cols-2 gap-3">
            {AMBIANCES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAnswers({ ...answers, ambiance: a })}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  answers.ambiance === a
                    ? "border-secondary bg-secondary/10"
                    : "border-border hover:border-secondary/40"
                }`}
              >
                <span className="text-sm font-medium">{a}</span>
                {answers.ambiance === a && (
                  <Check className="w-4 h-4 text-secondary mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — tone */}
      {step === 2 && (
        <div className="space-y-3">
          <Label className="text-base font-display">Quel ton de voix ?</Label>
          <p className="text-xs text-muted-foreground">
            Comment votre marque s'adresse-t-elle à ses clients ?
          </p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <Badge
                key={t}
                variant={answers.tone === t ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setAnswers({ ...answers, tone: t })}
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — values */}
      {step === 3 && (
        <div className="space-y-3">
          <Label className="text-base font-display">Vos valeurs cardinales</Label>
          <p className="text-xs text-muted-foreground">
            Sélectionnez 1 à 4 valeurs qui vous définissent.
          </p>
          <div className="flex flex-wrap gap-2">
            {VALUES.map((v) => (
              <Badge
                key={v}
                variant={answers.values.includes(v) ? "default" : "outline"}
                className="cursor-pointer px-3 py-2"
                onClick={() => toggleValue(v)}
              >
                {v}
              </Badge>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {answers.values.length}/4 sélectionnées
          </p>
        </div>
      )}

      {/* Step 4 — inspiration */}
      {step === 4 && (
        <div className="space-y-3">
          <Label className="text-base font-display">Une marque qui vous inspire ?</Label>
          <p className="text-xs text-muted-foreground">
            Pour donner un repère à l'IA (sans copier).
          </p>
          <Input
            placeholder="Ex : Aesop, Sézane, Apple, Patagonia…"
            value={answers.inspiration}
            onChange={(e) => setAnswers({ ...answers, inspiration: e.target.value })}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || generate.isPending}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <span className="text-xs text-muted-foreground">
          Étape {step + 1} / {totalSteps}
        </span>
        {step < totalSteps - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
          >
            Continuer <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canNext() || generate.isPending}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {generate.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Génération…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1" /> Générer mon identité
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}