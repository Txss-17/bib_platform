import { useMemo, useState } from “react”;
import {
ArrowLeft,
ArrowRight,
Check,
Loader2,
Sparkles,
} from “lucide-react”;
import { toast } from “sonner”;

import { Badge } from “@/components/ui/badge”;
import { Button } from “@/components/ui/button”;
import { Card } from “@/components/ui/card”;
import { Input } from “@/components/ui/input”;
import { Label } from “@/components/ui/label”;
import { Textarea } from “@/components/ui/textarea”;
import {
type StudioAnswers,
useGenerateBrandDNA,
} from “@/hooks/useBrandStudio”;

interface Props {
boutiqueId: string;
category?: string;
onComplete?: () => void;
}

interface BrandStudioAnswers extends StudioAnswers {
brandName: string;
activity: string;
offer: string;
differentiation: string;
story: string;

idealCustomer: string;
customerNeed: string;
customerResult: string;
marketPositioning: string;

visualTerritory: string;
materials: string;
preferredColors: string;
forbiddenColors: string;
visualReferences: string;

personality: string[];
brandValues: string[];
voice: string;
wordsToUse: string;
wordsToAvoid: string;
}

const PERSONALITIES = [
“Élégante”,
“Audacieuse”,
“Chaleureuse”,
“Minimaliste”,
“Créative”,
“Experte”,
“Naturelle”,
“Contemporaine”,
“Premium”,
“Accessible”,
];

const VALUES = [
“Qualité”,
“Durabilité”,
“Innovation”,
“Artisanat”,
“Transparence”,
“Inclusivité”,
“Savoir-faire”,
“Performance”,
“Bien-être”,
“Responsabilité”,
];

const VISUAL_TERRITORIES = [
{
value: “editorial”,
label: “Éditorial premium”,
description: “Sobre, sophistiqué, direction artistique forte.”,
},
{
value: “natural”,
label: “Naturel & organique”,
description: “Matières brutes, douceur, authenticité.”,
},
{
value: “minimal”,
label: “Minimal & architectural”,
description: “Clarté, espaces, formes précises.”,
},
{
value: “bold”,
label: “Audacieux & expressif”,
description: “Contrastes, caractère et impact visuel.”,
},
{
value: “craft”,
label: “Artisanal & humain”,
description: “Texture, geste, savoir-faire et proximité.”,
},
{
value: “future”,
label: “Contemporain & futuriste”,
description: “Innovation, précision et esthétique digitale.”,
},
];

const MARKET_POSITIONING = [
{
value: “accessible”,
label: “Accessible”,
description: “Une marque facile à adopter.”,
},
{
value: “premium”,
label: “Premium”,
description: “Une expérience et une qualité supérieures.”,
},
{
value: “luxury”,
label: “Luxe / exclusif”,
description: “Rareté, exigence et forte valeur perçue.”,
},
{
value: “expert”,
label: “Expert / spécialisé”,
description: “Une marque choisie pour son expertise.”,
},
{
value: “responsible”,
label: “Engagé / responsable”,
description: “La proposition de valeur repose aussi sur l’impact.”,
},
];

const STEPS = [
{
title: “Les fondations”,
shortTitle: “Fondations”,
description: “Ce que votre marque fait réellement.”,
},
{
title: “Le client & la promesse”,
shortTitle: “Client”,
description: “Pour qui vous existez et pourquoi.”,
},
{
title: “Le territoire visuel”,
shortTitle: “Univers”,
description: “L’univers dans lequel votre marque doit évoluer.”,
},
{
title: “La personnalité”,
shortTitle: “Voix”,
description: “La manière dont votre marque pense et s’exprime.”,
},
{
title: “La direction”,
shortTitle: “Validation”,
description: “Votre brief final avant génération.”,
},
];

function createInitialAnswers(category?: string): BrandStudioAnswers {
return {
audience: “”,
ambiance: “”,
tone: “”,
values: [],
inspiration: “”,
category,

brandName: "",
activity: "",
offer: "",
differentiation: "",
story: "",
idealCustomer: "",
customerNeed: "",
customerResult: "",
marketPositioning: "",
visualTerritory: "",
materials: "",
preferredColors: "",
forbiddenColors: "",
visualReferences: "",
personality: [],
brandValues: [],
voice: "",
wordsToUse: "",
wordsToAvoid: "",

};
}

function FieldHint({ children }: { children: React.ReactNode }) {
return (
{children}
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
{eyebrow}
{title}
{description}
);
}

export function BrandStudioWizard({
boutiqueId,
category,
onComplete,
}: Props) {
const [step, setStep] = useState(0);

const [answers, setAnswers] =
useState(() =>
createInitialAnswers(category),
);

const generate = useGenerateBrandDNA();

const totalSteps = STEPS.length;

const progress = ((step + 1) / totalSteps) * 100;

const update = (
key: K,
value: BrandStudioAnswers[K],
) => {
setAnswers((current) => ({
…current,
[key]: value,
}));
};

const toggleListValue = (
key: “personality” | “brandValues”,
value: string,
max: number,
) => {
setAnswers((current) => {
const currentValues = current[key];

  if (currentValues.includes(value)) {
    return {
      ...current,
      [key]: currentValues.filter(
        (item) => item !== value,
      ),
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
    !!answers.marketPositioning
  );
}
if (step === 2) {
  return !!answers.visualTerritory;
}
if (step === 3) {
  return (
    answers.personality.length >= 2 &&
    answers.brandValues.length >= 2 &&
    answers.voice.trim().length >= 10
  );
}
return true;

}, [answers, step]);

const goPrevious = () => {
if (generate.isPending) {
return;
}

setStep((current) => Math.max(0, current - 1));

};

const goNext = () => {
if (!canNext) {
return;
}

setStep((current) =>
  Math.min(totalSteps - 1, current + 1),
);

};

const handleSubmit = async () => {
try {
await generate.mutateAsync({
boutiqueId,
answers,
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

return (
Brand Studio · Direction de marque
      <div className="space-y-2">
        <h2 className="font-display text-2xl leading-tight text-foreground sm:text-3xl md:text-4xl">
          Construisons une vraie direction de marque.
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          L'IA ne va pas inventer votre marque à partir
          de cinq mots-clés. Elle va transformer vos choix
          en une identité cohérente, exploitable dans votre
          boutique.
        </p>
      </div>
    </header>
    <div className="mt-7 space-y-3 sm:mt-8">
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
      <div className="flex items-start justify-between gap-4 text-xs">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">
            Étape {step + 1} · {STEPS[step].title}
          </p>
          <p className="mt-0.5 hidden text-muted-foreground sm:block">
            {STEPS[step].description}
          </p>
        </div>
        <span className="shrink-0 text-muted-foreground">
          {step + 1}/{totalSteps}
        </span>
      </div>
    </div>
    <div className="mt-8 min-h-[420px] sm:mt-10">
      {step === 0 && (
        <div className="space-y-8">
          <SectionTitle
            eyebrow="01 · Fondations"
            title="Qu'est-ce que votre marque construit ?"
            description="Cette étape donne à l'IA les faits de départ. On cherche le fond avant de travailler la forme."
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
              />
              <FieldHint>
                Facultatif si le nom de la boutique BIB est déjà définitif.
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
                rows={4}
                className="resize-none leading-6"
              />
              <FieldHint>
                Minimum 10 caractères.
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
                rows={4}
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
                rows={4}
                className="resize-none leading-6"
              />
              <FieldHint>
                Évitez les formules génériques comme « qualité et passion ».
                Décrivez votre différence réelle.
              </FieldHint>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="story">
                Origine / histoire
                <span className="ml-1 font-normal text-muted-foreground">
                  (facultatif)
                </span>
              </Label>
              <Textarea
                id="story"
                value={answers.story}
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
            description="L'objectif est de comprendre le contexte d'achat et le résultat recherché, pas seulement de définir une tranche d'âge."
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
                rows={4}
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
                rows={4}
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
                rows={4}
                className="resize-none leading-6"
              />
            </div>
            <div className="space-y-3">
              <div>
                <Label>
                  Positionnement perçu
                </Label>
                <FieldHint>
                  Choisissez celui qui correspond le mieux à votre intention.
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
                        "min-h-24 rounded-2xl border-2 p-4 text-left transition-all",
                        "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selected
                          ? "border-secondary bg-secondary/10"
                          : "border-border bg-background/40 hover:border-secondary/40 hover:bg-secondary/5",
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
              <Label>Territoire dominant</Label>
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
                        "min-h-24 rounded-2xl border-2 p-4 text-left transition-all",
                        "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selected
                          ? "border-secondary bg-secondary/10"
                          : "border-border bg-background/40 hover:border-secondary/40 hover:bg-secondary/5",
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
              vous indiquez une direction, l'IA compose
              ensuite une identité spécifique. Elle ne doit
              pas simplement recopier une palette choisie
              dans un formulaire.
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-8">
          <SectionTitle
            eyebrow="04 · Personnalité & voix"
            title="Si votre marque était une personne, comment parlerait-elle ?"
            description="Ces choix serviront ensuite au copywriting, aux scènes, aux CTA et aux contenus générés."
          />
          <div className="space-y-7">
            <div className="space-y-3">
              <div>
                <Label>Traits de personnalité</Label>
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
                          4,
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
                <Label>Valeurs prioritaires</Label>
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
                          4,
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
                rows={4}
                className="resize-none leading-6"
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="words-to-use">
                  Mots / expressions à privilégier
                </Label>
                <Textarea
                  id="words-to-use"
                  value={answers.wordsToUse}
                  onChange={(event) =>
                    update(
                      "wordsToUse",
                      event.target.value,
                    )
                  }
                  placeholder="Quelques mots qui doivent revenir dans l'univers de marque…"
                  rows={4}
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
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Fondations
              </p>
              <p className="mt-2 text-sm font-medium">
                {answers.activity ||
                  "Activité non renseignée"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {answers.offer ||
                  "Offre non renseignée"}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Différenciation
              </p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                {answers.differentiation ||
                  "Non renseignée"}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Client
              </p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                {answers.idealCustomer ||
                  "Client idéal non renseigné"}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Promesse
              </p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                {answers.customerResult ||
                  "Résultat non renseigné"}
              </p>
            </Card>
            <Card className="p-4">
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
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {answers.materials}
                </p>
              )}
            </Card>
            <Card className="p-4">
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
            <Card className="p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Voix
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {answers.voice ||
                  "Voix non renseignée"}
              </p>
            </Card>
          </div>
          <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-5">
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
          </div>
        </div>
      )}
    </div>
    <footer className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="hidden text-center text-xs text-muted-foreground sm:block">
        Vos réponses restent modifiables jusqu'à la génération.
      </div>
      {step < totalSteps - 1 ? (
        <Button
          type="button"
          onClick={goNext}
          disabled={!canNext}
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
