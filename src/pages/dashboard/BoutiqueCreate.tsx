import { studioOptionLabel } from "@/lib/studioOptionLabels";

import { translateUi, getUiLanguage } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  Loader2,
  Package,
  Sparkles,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBoutique } from "@/hooks/useBoutiques";

const STEPS = [
  {
    id: 1,
    get title() {
      return translateUi("Informations");
    },
    get description() {
      return translateUi("Définissez les bases de votre boutique.");
    },
    icon: Store,
  },
  {
    id: 2,
    get title() {
      return translateUi("Préparation");
    },
    get description() {
      return translateUi("Comprenez les prochaines étapes.");
    },
    icon: Sparkles,
  },
  {
    id: 3,
    get title() {
      return translateUi("Récapitulatif");
    },
    get description() {
      return translateUi("Vérifiez avant de créer.");
    },
    icon: Eye,
  },
] as const;

const CATEGORIES = [
  "Maison",
  "Beauté",
  "Tech",
  "Mode",
  "Sport",
  "Alimentation",
  "Jardin",
  "Enfants",
] as const;

type FormData = {
  name: string;
  slug: string;
  category: string;
  description: string;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  useLanguage();
  return (
    <nav aria-label={translateUi("Étapes de création")} className="mb-8">
      <ol className="flex items-center justify-center">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCurrent = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <li
              key={step.id}
              className="flex min-w-0 items-center"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : isCompleted
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                <span
                  className={[
                    "whitespace-nowrap text-xs font-medium sm:text-sm",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {step.title}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={[
                    "mx-3 mb-6 h-px w-8 sm:mx-6 sm:w-16",
                    currentStep > step.id ? "bg-primary" : "bg-border",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  useLanguage();
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
      {required && (
        <span className="ml-1 text-primary" aria-hidden="true">
          *
        </span>
      )}
    </Label>
  );
}

export default function BoutiqueCreate() {
  useLanguage();
  const navigate = useNavigate();
  const createBoutique = useCreateBoutique();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    category: "",
    description: "",
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleNameChange = (name: string) => {
    setFormData((current) => ({
      ...current,
      name,
      slug: slugManuallyEdited ? current.slug : slugify(name),
    }));
  };

  const nameError = useMemo(() => {
    const name = formData.name.trim();

    if (!name) {
      return translateUi("Le nom de la boutique est obligatoire.");
    }

    if (name.length < 2) {
      return translateUi("Le nom doit contenir au moins 2 caractères.");
    }

    if (name.length > 100) {
      return translateUi("Le nom ne peut pas dépasser 100 caractères.");
    }

    return null;
  }, [formData.name, getUiLanguage()]);

  const slugError = useMemo(() => {
    const slug = formData.slug.trim();

    if (!slug) {
      return translateUi("L’adresse de la boutique est obligatoire.");
    }

    if (slug.length < 2) {
      return translateUi("L’adresse doit contenir au moins 2 caractères.");
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return translateUi(
        "Utilisez uniquement des lettres minuscules, des chiffres et des tirets.",
      );
    }

    return null;
  }, [formData.slug, getUiLanguage()]);

  const isStepOneValid = !nameError && !slugError && Boolean(formData.category);

  const canProceed = currentStep !== 1 || isStepOneValid;

  const goToNextStep = () => {
    if (currentStep === 1 && !isStepOneValid) {
      toast.error(
        translateUi(
          "Vérifiez le nom, l’adresse et la catégorie de votre boutique.",
        ),
      );
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 3));
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const handleCreateBoutique = async () => {
    if (!isStepOneValid) {
      setCurrentStep(1);
      toast.error(translateUi("Certaines informations sont manquantes."));
      return;
    }

    try {
      const boutique = await createBoutique.mutateAsync({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        category: formData.category,
        description: formData.description.trim() || null,
        theme_settings: null,
        status: "draft",
      });

      toast.success(translateUi("Boutique créée en brouillon."));

      // Route déclarée dans App.tsx :
      // /dashboard/boutiques/:id/edit
      navigate(`/dashboard/boutiques/${boutique.id}/edit`);
    } catch (error) {
      console.error("Erreur de création de boutique :", error);

      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: unknown }).code ?? "")
          : "";

      if (code === "23505") {
        toast.error(
          translateUi(
            "Cette adresse est déjà utilisée. Choisissez une autre URL.",
          ),
        );
        setCurrentStep(1);
        return;
      }

      toast.error(
        error instanceof Error &&
          error.message === translateUi("Utilisateur non authentifié.")
          ? translateUi(
              "Votre session a expiré. Reconnectez-vous puis réessayez.",
            )
          : translateUi(
              "Impossible de créer la boutique. Vérifiez les informations puis réessayez.",
            ),
      );
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Espace marchand")}
        title={translateUi("Créer une boutique")}
        subtitle={translateUi(
          "Posez les bases de votre boutique avant de préparer son identité et son catalogue.",
        )}
        breadcrumbs={[
          { label: translateUi("Dashboard"), href: "/dashboard" },
          {
            label: translateUi("Boutiques"),
            href: "/dashboard/boutiques",
          },
          { label: translateUi("Nouvelle boutique") },
        ]}
        actions={
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to="/dashboard/boutiques">
              <ArrowLeft className="h-4 w-4" />
              {translateUi("Mes boutiques")}
            </Link>
          </Button>
        }
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-background to-background p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {translateUi("Votre espace de vente")}
              </p>

              <h2 className="mt-1 text-lg font-semibold text-foreground sm:text-xl">
                {translateUi("Une boutique, un parcours structuré.")}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {translateUi(
                  "La création initiale ne publie pas votre boutique. Vous pourrez ensuite travailler son identité de marque, configurer son contenu et préparer son catalogue.",
                )}
              </p>
            </div>
          </div>
        </div>

        <StepIndicator currentStep={currentStep} />

        <SectionCard flush contentClassName="p-5 sm:p-8">
          {currentStep === 1 && (
            <section
              aria-labelledby="step-information-title"
              className="space-y-6"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  {translateUi("Étape 01")}
                </p>

                <h2
                  id="step-information-title"
                  className="mt-2 text-xl font-semibold text-foreground"
                >
                  {translateUi("Les informations essentielles")}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {translateUi(
                    "Définissez le nom, l’adresse publique et le secteur principal de votre boutique.",
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="boutique-name" required>
                  {translateUi("Nom de la boutique")}
                </FieldLabel>

                <Input
                  id="boutique-name"
                  value={formData.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder={translateUi("Ex. Atelier Horizon")}
                  autoComplete="organization"
                  maxLength={100}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={
                    nameError ? "boutique-name-error" : undefined
                  }
                />

                {nameError ? (
                  <p
                    id="boutique-name-error"
                    className="text-xs text-destructive"
                  >
                    {nameError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {translateUi("Choisissez un nom clair et reconnaissable.")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="boutique-slug" required>
                  {translateUi("Adresse publique")}
                </FieldLabel>

                <div className="flex min-w-0">
                  <div className="flex shrink-0 items-center rounded-l-md border border-r-0 border-input bg-muted px-2 text-xs text-muted-foreground sm:px-3 sm:text-sm">
                    <span className="hidden sm:inline">
                      brand-in-a-box.space
                    </span>
                    <span className="sm:hidden">BIB /</span>
                    <span className="mx-1">/boutique/</span>
                  </div>

                  <Input
                    id="boutique-slug"
                    value={formData.slug}
                    onChange={(event) => {
                      setSlugManuallyEdited(true);
                      updateField("slug", slugify(event.target.value));
                    }}
                    placeholder="atelier-horizon"
                    autoComplete="off"
                    maxLength={80}
                    className="min-w-0 rounded-l-none"
                    aria-invalid={Boolean(slugError)}
                    aria-describedby={
                      slugError ? "boutique-slug-error" : "boutique-slug-help"
                    }
                  />
                </div>

                {slugError ? (
                  <p
                    id="boutique-slug-error"
                    className="text-xs text-destructive"
                  >
                    {slugError}
                  </p>
                ) : (
                  <p
                    id="boutique-slug-help"
                    className="text-xs text-muted-foreground"
                  >
                    {translateUi(
                      "L’adresse doit être unique. Si elle est déjà utilisée, vous pourrez en choisir une autre.",
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="boutique-category" required>
                  {translateUi("Catégorie principale")}
                </FieldLabel>

                <Select
                  value={formData.category}
                  onValueChange={(value) => updateField("category", value)}
                >
                  <SelectTrigger id="boutique-category">
                    <SelectValue
                      placeholder={translateUi("Sélectionner un secteur")}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem
                        key={studioOptionLabel(category, "category")}
                        value={studioOptionLabel(category, "category")}
                      >
                        {studioOptionLabel(category, "category")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  {translateUi(
                    "Cette catégorie aide à cadrer l’identité de votre boutique.",
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="boutique-description">
                  {translateUi("Présentation de la boutique")}
                </FieldLabel>

                <Textarea
                  id="boutique-description"
                  value={formData.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder={translateUi(
                    "Que proposez-vous et qu’est-ce qui distingue votre boutique ?",
                  )}
                  rows={5}
                  maxLength={1000}
                />

                <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                  <span>{translateUi("Facultatif à cette étape.")}</span>
                  <span className="tabular-nums">
                    {formData.description.length}/1000
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {translateUi(
                        "Aucun produit arbitraire n’est ajouté à cette étape",
                      )}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {translateUi(
                        "Le catalogue sera préparé séparément à partir des produits autorisés et disponibles dans l’écosystème BIB.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section
              aria-labelledby="step-preparation-title"
              className="space-y-6"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  {translateUi("Étape 02")}
                </p>

                <h2
                  id="step-preparation-title"
                  className="mt-2 text-xl font-semibold text-foreground"
                >
                  {translateUi("Préparer votre boutique")}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {translateUi(
                    "La boutique sera d’abord créée en brouillon. Voici les principaux chantiers qui suivront.",
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-4 rounded-xl border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground">
                      {translateUi("1. Identité de marque")}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {translateUi(
                        "Définir le positionnement, la clientèle, la promesse et l’univers visuel dans le Brand Studio.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-xl border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Package className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground">
                      {translateUi("2. Catalogue et offre")}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {translateUi(
                        "Sélectionner les produits disponibles, vérifier leur état et préparer leur présentation.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-xl border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Eye className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-medium text-foreground">
                      {translateUi("3. Vérification avant publication")}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {translateUi(
                        "Contrôler la présentation, les informations de vente et les éléments requis avant toute mise en ligne.",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-secondary/40 bg-secondary/10 p-4">
                <p className="text-sm font-medium text-foreground">
                  {translateUi("À retenir")}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {translateUi(
                    "Créer la boutique ne signifie ni que le catalogue est validé, ni que la boutique est publiée. Ces étapes restent distinctes.",
                  )}
                </p>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section aria-labelledby="step-summary-title" className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  {translateUi("Étape 03")}
                </p>

                <h2
                  id="step-summary-title"
                  className="mt-2 text-xl font-semibold text-foreground"
                >
                  {translateUi("Vérifier avant la création")}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {translateUi(
                    "Vérifiez ces informations. La boutique sera créée en brouillon et ne sera pas publiée automatiquement.",
                  )}
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border">
                <dl className="divide-y divide-border">
                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      {translateUi("Nom")}
                    </dt>
                    <dd className="break-words font-medium text-foreground">
                      {formData.name.trim() || translateUi("Non renseigné")}
                    </dd>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      {translateUi("Adresse")}
                    </dt>
                    <dd className="break-all font-mono text-sm text-primary">
                      /boutique/{formData.slug || "—"}
                    </dd>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      {translateUi("Catégorie")}
                    </dt>
                    <dd className="font-medium text-foreground">
                      {formData.category || translateUi("Non renseignée")}
                    </dd>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      Description
                    </dt>
                    <dd className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                      {formData.description.trim() ||
                        translateUi("À compléter ultérieurement.")}
                    </dd>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      {translateUi("Statut initial")}
                    </dt>
                    <dd>
                      <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-medium text-foreground">
                        <span className="h-2 w-2 rounded-full bg-secondary" />
                        {translateUi("Brouillon")}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {translateUi("Prêt à créer")}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {translateUi(
                        "Après validation, vous serez redirigé vers l’espace de configuration de cette boutique.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {currentStep === 1 ? (
                <Button variant="ghost" asChild>
                  <Link to="/dashboard/boutiques">
                    {translateUi("Annuler")}
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={createBoutique.isPending}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {translateUi("Précédent")}
                </Button>
              )}
            </div>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!canProceed}
                className="gap-2"
              >
                {translateUi("Continuer")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCreateBoutique}
                disabled={createBoutique.isPending || !isStepOneValid}
                className="gap-2"
              >
                {createBoutique.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {createBoutique.isPending
                  ? translateUi("Création en cours…")
                  : translateUi("Créer en brouillon")}
              </Button>
            )}
          </div>
        </SectionCard>

        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          {translateUi(
            "Les champs marqués d’un astérisque sont obligatoires. La création ne déclenche pas la publication.",
          )}
        </p>
      </div>
    </DashboardLayout>
  );
}
