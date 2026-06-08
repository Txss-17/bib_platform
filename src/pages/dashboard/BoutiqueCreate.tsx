import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Package, Eye, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateBoutique } from "@/hooks/useBoutiques";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Informations", icon: Package },
  { id: 2, title: "Produits", icon: Package },
  { id: 3, title: "Aperçu", icon: Eye },
];

const categories = [
  "Maison",
  "Beauté",
  "Tech",
  "Mode",
  "Sport",
  "Alimentation",
  "Jardin",
  "Enfants",
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            currentStep === step.id 
              ? "bg-primary text-primary-foreground" 
              : currentStep > step.id 
                ? "bg-success text-success-foreground"
                : "bg-muted text-muted-foreground"
          }`}>
            {currentStep > step.id ? (
              <Check className="w-4 h-4" />
            ) : (
              <step.icon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium hidden md:inline">{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${
              currentStep > step.id ? "bg-success" : "bg-border"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BoutiqueCreate() {
  const navigate = useNavigate();
  const createBoutique = useCreateBoutique();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    description: "",
  });

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (key === "name") {
      const slug = value.toString().toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name && formData.category && formData.slug;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const handleCreateBoutique = async () => {
    try {
      await createBoutique.mutateAsync({
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        description: formData.description || null,
        theme_settings: null,
        status: "draft",
      });

      toast.success("Boutique créée — passons au Brand Studio IA.");
      navigate("/dashboard/boutiques");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Cette URL de boutique est déjà utilisée. Choisissez un autre nom.");
      } else {
        toast.error("Erreur lors de la création de la boutique");
      }
      console.error("Error creating boutique:", error);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Boutiques"
        title="Créer une boutique"
        subtitle="Lancez votre boutique en quelques étapes."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Boutiques", href: "/dashboard/boutiques" },
          { label: "Nouvelle" },
        ]}
        actions={
          <Link to="/dashboard/boutiques">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
        }
      />

      <StepIndicator currentStep={currentStep} />

      <div className="max-w-2xl mx-auto">
        <SectionCard flush contentClassName="p-6 sm:p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Nom de la boutique *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Ma Super Boutique"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL de la boutique</Label>
                <div className="flex items-center mt-2">
                  <span className="px-3 py-2 bg-muted text-muted-foreground text-sm rounded-l-md border border-r-0 border-input">
                    linksy.com/
                  </span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => updateFormData("slug", e.target.value)}
                    className="rounded-l-none"
                    placeholder="ma-super-boutique"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(v) => updateFormData("category", v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Décrivez votre boutique en quelques mots..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 flex gap-3">
                <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <p className="font-medium">Identité visuelle générée par l'IA</p>
                  <p className="text-muted-foreground mt-1">
                    Palette, typographie, copy, menu et structure de page seront créés
                    par le Brand Studio à l'ouverture de l'éditeur. Chaque boutique reçoit
                    une identité unique — jamais deux fois la même mise en page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Products */}
          {currentStep === 2 && (
            <div className="space-y-6 text-center py-8">
              <Package className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Ajoutez vos produits</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Vous pourrez ajouter des produits depuis notre catalogue fournisseur après la création de votre boutique.
                </p>
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <Link to="/dashboard/produits-fournisseurs">
                  <Package className="w-4 h-4" />
                  Voir le catalogue fournisseur
                </Link>
              </Button>
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-foreground mb-4">Récapitulatif</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Nom</dt>
                    <dd className="font-medium text-foreground">{formData.name || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">URL</dt>
                    <dd className="font-medium text-primary">linksy.com/{formData.slug || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Catégorie</dt>
                    <dd className="font-medium text-foreground">{formData.category || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Identité visuelle</dt>
                    <dd className="font-medium text-accent flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Brand Studio IA
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground">
                  ✨ Votre boutique sera créée en mode <strong>brouillon</strong>. 
                  Le Brand Studio se lance automatiquement à l'ouverture de l'éditeur
                  pour générer palette, typo, copy et structure de page sur-mesure.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                className="gap-2" 
                onClick={handleCreateBoutique}
                disabled={createBoutique.isPending}
              >
                {createBoutique.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Créer ma boutique
              </Button>
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
