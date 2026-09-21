import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  PageHeader,
  SectionCard,
} from "@/components/dashboard/shared";
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

const steps = [
  {
    id: 1,
    title: "Informations",
    icon: Package,
  },
  {
    id: 2,
    title: "Configuration",
    icon: Sparkles,
  },
  {
    id: 3,
    title: "Aperçu",
    icon: Eye,
  },
] as const;

const categories = [
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

function StepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="mb-8 flex items-center justify-center overflow-x-auto">
      <div className="flex min-w-max items-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCurrent = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              className="flex items-center"
            >
              <div
                className={[
                  "flex items-center gap-2 rounded-full px-4 py-2",
                  "text-sm font-medium transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}

                <span className="hidden md:inline">
                  {step.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={[
                    "mx-2 h-0.5 w-10 sm:w-12",
                    currentStep > step.id
                      ? "bg-success"
                      : "bg-border",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BoutiqueCreate() {
  const navigate = useNavigate();
  const createBoutique = useCreateBoutique();

  const [currentStep, setCurrentStep] =
    useState(1);

  const [formData, setFormData] =
    useState<FormData>({
      name: "",
      slug: "",
      category: "",
      description: "",
    });

  const updateFormData = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleNameChange = (
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      name: value,
      slug:
        current.slug ===
          slugify(current.name) ||
        !current.slug
          ? slugify(value)
          : current.slug,
    }));
  };

  const isStepOneValid = useMemo(() => {
    return (
      formData.name.trim().length >= 2 &&
      formData.slug.trim().length >= 2 &&
      !!formData.category
    );
  }, [
    formData.name,
    formData.slug,
    formData.category,
  ]);

  const canProceed =
    currentStep === 1
      ? isStepOneValid
      : true;

  const goToNextStep = () => {
    if (!canProceed) {
      return;
    }

    setCurrentStep((step) =>
      Math.min(step + 1, 3),
    );
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) =>
      Math.max(step - 1, 1),
    );
  };

  const handleCreateBoutique =
    async () => {
      if (!isStepOneValid) {
        setCurrentStep(1);
        return;
      }

      try {
        const boutique =
          await createBoutique.mutateAsync({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            category: formData.category,
            description:
              formData.description.trim() ||
              null,
            theme_settings: null,
            status: "draft",
          });

        toast.success(
          "Boutique créée en brouillon.",
        );

        navigate(
          `/dashboard/boutiques/edit/${boutique.id}`,
        );
      } catch (error) {
        console.error(
          "Error creating boutique:",
          error,
        );

        const code =
          error &&
          typeof error === "object" &&
          "code" in error
            ? String(
                (
                  error as {
                    code?: unknown;
                  }
                ).code ?? "",
              )
            : "";

        if (code === "23505") {
          toast.error(
            "Cette URL de boutique est déjà utilisée. Choisissez un autre nom.",
          );
          setCurrentStep(1);
          return;
        }

        toast.error(
          "Impossible de créer la boutique. Vérifiez les informations puis réessayez.",
        );
      }
    };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Boutiques"
        title="Créer une boutique"
        subtitle="Préparez votre boutique BIB avant sa mise en ligne."
        breadcrumbs={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Boutiques",
            href: "/dashboard/boutiques",
          },
          {
            label: "Nouvelle",
          },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            asChild
          >
            <Link to="/dashboard/boutiques">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
        }
      />

      <StepIndicator
        currentStep={currentStep}
      />

      <div className="mx-auto max-w-2xl">
        <SectionCard
          flush
          contentClassName="p-6 sm:p-8"
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">
                  Nom de la boutique *
                </Label>

                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Ma boutique"
                  autoComplete="organization"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="slug">
                  Adresse de la boutique *
                </Label>

                <div className="mt-2 flex items-center">
                  <span className="rounded-l-md border border-r-0 border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                    brand-in-a-box.space/boutique/
                  </span>

                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(event) =>
                      updateFormData(
                        "slug",
                        slugify(
                          event.target.value,
                        ),
                      )
                    }
                    className="rounded-l-none"
                    placeholder="ma-boutique"
                    autoComplete="off"
                  />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Cette adresse identifie votre
                  boutique publiquement. Elle peut
                  être modifiée avant la publication
                  si le système le permet.
                </p>
              </div>

              <div>
                <Label htmlFor="category">
                  Catégorie *
                </Label>

                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    updateFormData(
                      "category",
                      value,
                    )
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map(
                      (category) => (
                        <SelectItem
                          key={category}
                          value={category}
                        >
                          {category}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">
                  Description
                </Label>

                <Textarea
                  id="description"
                  value={
                    formData.description
                  }
                  onChange={(event) =>
                    updateFormData(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Présentez votre boutique en quelques lignes..."
                  className="mt-2"
                  rows={5}
                />

                <p className="mt-2 text-xs text-muted-foreground">
                  Cette description pourra être
                  enrichie avant la publication.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-foreground">
                  Préparer l'identité de la boutique
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                  La boutique sera créée en
                  brouillon. Vous pourrez ensuite
                  travailler son identité, ses
                  contenus, ses produits et sa
                  publication depuis votre espace.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <Sparkles className="h-5 w-5 text-primary" />

                  <p className="mt-3 text-sm font-medium text-foreground">
                    Identité
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Positionnement, identité visuelle
                    et contenu.
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/20 p-4">
                  <Package className="h-5 w-5 text-primary" />

                  <p className="mt-3 text-sm font-medium text-foreground">
                    Catalogue
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Sélection des produits BIB
                    disponibles pour votre boutique.
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/20 p-4">
                  <Eye className="h-5 w-5 text-primary" />

                  <p className="mt-3 text-sm font-medium text-foreground">
                    Publication
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Vérifications et préparation avant
                    la mise en ligne.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm leading-6 text-foreground">
                  <strong>
                    La création ne publie pas la boutique.
                  </strong>{" "}
                  Elle reste en brouillon jusqu'à ce que
                  les éléments nécessaires soient
                  configurés et que la publication soit
                  effectuée.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Vérifiez les informations
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Votre boutique sera créée en
                  brouillon.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border">
                <dl className="divide-y divide-border">
                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      Nom
                    </dt>

                    <dd className="font-medium text-foreground">
                      {formData.name || "—"}
                    </dd>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      Adresse
                    </dt>

                    <dd className="break-all font-mono text-sm text-primary">
                      /boutique/
                      {formData.slug || "—"}
                    </dd>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      Catégorie
                    </dt>

                    <dd className="font-medium text-foreground">
                      {formData.category ||
                        "—"}
                    </dd>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      Description
                    </dt>

                    <dd className="whitespace-pre-wrap text-sm text-foreground">
                      {formData.description ||
                        "Aucune description pour le moment."}
                    </dd>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[160px_1fr]">
                    <dt className="text-sm text-muted-foreground">
                      État initial
                    </dt>

                    <dd className="font-medium text-foreground">
                      Brouillon
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="font-medium text-foreground">
                      Prochaine étape
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Après la création, vous
                      pourrez poursuivre la
                      configuration de votre boutique
                      depuis son espace de gestion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={
                  goToPreviousStep
                }
                disabled={
                  createBoutique.isPending
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
            ) : (
              <Button
                variant="ghost"
                asChild
              >
                <Link to="/dashboard/boutiques">
                  Annuler
                </Link>
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={goToNextStep}
                disabled={!canProceed}
                className="gap-2"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={
                  handleCreateBoutique
                }
                disabled={
                  createBoutique.isPending ||
                  !isStepOneValid
                }
                className="gap-2"
              >
                {createBoutique.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}

                {createBoutique.isPending
                  ? "Création..."
                  : "Créer la boutique"}
              </Button>
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
