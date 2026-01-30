import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Upload, Palette, Package, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const steps = [
  { id: 1, title: "Informations", icon: Package },
  { id: 2, title: "Identité visuelle", icon: Palette },
  { id: 3, title: "Produits", icon: Package },
  { id: 4, title: "Aperçu", icon: Eye },
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

const colorSchemes = [
  { name: "Moderne", primary: "#3b82f6", secondary: "#1e40af" },
  { name: "Nature", primary: "#22c55e", secondary: "#15803d" },
  { name: "Élégant", primary: "#8b5cf6", secondary: "#6d28d9" },
  { name: "Chaleureux", primary: "#f97316", secondary: "#c2410c" },
  { name: "Minimaliste", primary: "#374151", secondary: "#1f2937" },
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
                ? "bg-green-500 text-white"
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
              currentStep > step.id ? "bg-green-500" : "bg-border"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BoutiqueCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    description: "",
    colorScheme: "",
    logo: null as File | null,
  });

  const updateFormData = (key: string, value: string | File | null) => {
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
      case 1: return formData.name && formData.category;
      case 2: return formData.colorScheme;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <DashboardLayout title="Créer une boutique" subtitle="Lancez votre boutique en quelques étapes">
      <Link to="/dashboard/boutiques" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour aux boutiques
      </Link>

      <StepIndicator currentStep={currentStep} />

      <Card className="bg-card border-border/50 max-w-2xl mx-auto">
        <CardContent className="p-8">
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
            </div>
          )}

          {/* Step 2: Visual Identity */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Logo de la boutique</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Glissez votre logo ici ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 2MB</p>
                </div>
              </div>

              <div>
                <Label>Palette de couleurs</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {colorSchemes.map(scheme => (
                    <button
                      key={scheme.name}
                      onClick={() => updateFormData("colorScheme", scheme.name)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.colorScheme === scheme.name 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.primary }} />
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.secondary }} />
                      </div>
                      <p className="text-sm font-medium text-foreground">{scheme.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Products */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center py-8">
              <Package className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Ajoutez vos produits</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Vous pourrez ajouter des produits depuis notre catalogue fournisseur après la création de votre boutique.
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Package className="w-4 h-4" />
                Voir le catalogue fournisseur
              </Button>
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 4 && (
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
                    <dt className="text-muted-foreground">Thème</dt>
                    <dd className="font-medium text-foreground">{formData.colorScheme || "-"}</dd>
                  </div>
                </dl>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground">
                  ✨ Votre boutique sera créée en mode <strong>brouillon</strong>. 
                  Vous pourrez la publier une fois que vous aurez ajouté des produits.
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

            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button className="gap-2">
                <Check className="w-4 h-4" />
                Créer ma boutique
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
