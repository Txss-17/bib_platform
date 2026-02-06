import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Eye, Save, Loader2, ExternalLink, Type, Palette, Layout, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { StorefrontPreview } from "@/components/storefront/StorefrontPreview";
import { getTemplateForCategory, type ThemeSettings, type SectionConfig } from "@/lib/boutiqueTemplates";

const colorSchemes = [
  { name: "Moderne", primary: "#3b82f6", secondary: "#1e40af" },
  { name: "Nature", primary: "#22c55e", secondary: "#15803d" },
  { name: "Élégant", primary: "#8b5cf6", secondary: "#6d28d9" },
  { name: "Chaleureux", primary: "#f97316", secondary: "#c2410c" },
  { name: "Minimaliste", primary: "#374151", secondary: "#1f2937" },
  { name: "Terracotta", primary: "#b45309", secondary: "#92400e" },
  { name: "Rose", primary: "#db2777", secondary: "#9d174d" },
  { name: "Océan", primary: "#0891b2", secondary: "#0e7490" },
];

const fontPairs = [
  { heading: "Playfair Display", body: "Inter", name: "Élégant Classique" },
  { heading: "Cormorant Garamond", body: "Lato", name: "Sophistiqué" },
  { heading: "Space Grotesk", body: "Inter", name: "Moderne Tech" },
  { heading: "Montserrat", body: "Open Sans", name: "Sportif" },
  { heading: "Libre Baskerville", body: "Source Sans Pro", name: "Éditorial" },
  { heading: "Fredoka One", body: "Nunito", name: "Ludique" },
];

export default function BoutiqueEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    colorScheme: "Moderne",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
  });

  const [customTexts, setCustomTexts] = useState({
    heroTitle: "",
    heroSubtitle: "",
    aboutText: "",
  });

  // Fetch boutique
  const { data: boutique, isLoading } = useQuery({
    queryKey: ["boutique-edit", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch products for preview
  const { data: products = [] } = useQuery({
    queryKey: ["boutique-products-preview", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          public_price,
          supplier_products (name, image_url)
        `)
        .eq("boutique_id", id)
        .eq("status", "active")
        .limit(4);
      if (error) throw error;
      return data.map((p, i) => ({
        id: p.id,
        name: p.supplier_products?.name || "Produit",
        price: Number(p.public_price),
        image_url: p.supplier_products?.image_url,
        isPopular: i === 0,
      }));
    },
    enabled: !!id,
  });

  // Initialize from boutique data
  useEffect(() => {
    if (boutique?.theme_settings) {
      const settings = (boutique.theme_settings as unknown) as ThemeSettings;
      setThemeSettings({
        colorScheme: settings.colorScheme || "Moderne",
        primaryColor: settings.primaryColor || "#3b82f6",
        secondaryColor: settings.secondaryColor || "#1e40af",
        fonts: settings.fonts,
        sections: settings.sections,
      });
      setCustomTexts({
        heroTitle: settings.customHeroTitle || "",
        heroSubtitle: settings.customHeroSubtitle || "",
        aboutText: settings.customAboutText || "",
      });
    } else if (boutique) {
      const template = getTemplateForCategory(boutique.category);
      setThemeSettings({
        colorScheme: "Moderne",
        primaryColor: "#3b82f6",
        secondaryColor: "#1e40af",
        fonts: template.fonts,
        sections: template.sections,
      });
    }
  }, [boutique]);

  // Update mutation
  const updateBoutique = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const fullSettings: ThemeSettings = {
        ...themeSettings,
        customHeroTitle: customTexts.heroTitle || undefined,
        customHeroSubtitle: customTexts.heroSubtitle || undefined,
        customAboutText: customTexts.aboutText || undefined,
      };
      const { error } = await supabase
        .from("boutiques")
        .update({ theme_settings: fullSettings as any })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Modifications enregistrées !");
      queryClient.invalidateQueries({ queryKey: ["boutique-edit", id] });
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde");
    },
  });

  // Publish mutation
  const publishBoutique = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const { error } = await supabase
        .from("boutiques")
        .update({ status: "published" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Boutique publiée !");
      queryClient.invalidateQueries({ queryKey: ["boutiques"] });
      queryClient.invalidateQueries({ queryKey: ["boutique-edit", id] });
    },
    onError: () => {
      toast.error("Erreur lors de la publication");
    },
  });

  const updateSection = (sectionType: string, enabled: boolean) => {
    const template = getTemplateForCategory(boutique?.category || "Mode");
    const currentSections = themeSettings.sections || template.sections;
    const updatedSections = currentSections.map(s =>
      s.type === sectionType ? { ...s, enabled } : s
    );
    setThemeSettings(prev => ({ ...prev, sections: updatedSections }));
  };

  const updateColor = (scheme: typeof colorSchemes[0]) => {
    setThemeSettings(prev => ({
      ...prev,
      colorScheme: scheme.name,
      primaryColor: scheme.primary,
      secondaryColor: scheme.secondary,
    }));
  };

  const updateFonts = (pair: typeof fontPairs[0]) => {
    setThemeSettings(prev => ({
      ...prev,
      fonts: { heading: pair.heading, body: pair.body },
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Chargement...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!boutique) {
    return (
      <DashboardLayout title="Boutique introuvable">
        <Link to="/dashboard/boutiques">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux boutiques
          </Button>
        </Link>
      </DashboardLayout>
    );
  }

  const template = getTemplateForCategory(boutique.category);
  const sections = themeSettings.sections || template.sections;

  const mergedTheme: ThemeSettings = {
    ...themeSettings,
    customHeroTitle: customTexts.heroTitle || undefined,
    customHeroSubtitle: customTexts.heroSubtitle || undefined,
    customAboutText: customTexts.aboutText || undefined,
  };

  return (
    <DashboardLayout 
      title={`Éditer: ${boutique.name}`} 
      subtitle="Personnalisez l'apparence de votre boutique"
    >
      <div className="flex items-center justify-between mb-6">
        <Link to="/dashboard/boutiques">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div className="flex gap-2">
          {boutique.status === "published" && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/boutique/${boutique.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir le site
              </a>
            </Button>
          )}
          <Button 
            onClick={() => updateBoutique.mutate()}
            disabled={updateBoutique.isPending}
          >
            {updateBoutique.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer
          </Button>
          {boutique.status === "draft" && (
            <Button 
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => publishBoutique.mutate()}
              disabled={publishBoutique.isPending}
            >
              <Eye className="w-4 h-4 mr-2" />
              Publier
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor panel */}
        <div className="space-y-4">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="gap-1.5">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Couleurs</span>
              </TabsTrigger>
              <TabsTrigger value="fonts" className="gap-1.5">
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">Polices</span>
              </TabsTrigger>
              <TabsTrigger value="sections" className="gap-1.5">
                <Layout className="w-4 h-4" />
                <span className="hidden sm:inline">Sections</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Contenu</span>
              </TabsTrigger>
            </TabsList>

            {/* Colors tab */}
            <TabsContent value="colors">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Palette de couleurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {colorSchemes.map(scheme => (
                      <button
                        key={scheme.name}
                        onClick={() => updateColor(scheme)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          themeSettings.colorScheme === scheme.name
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.primary }} />
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.secondary }} />
                        </div>
                        <p className="text-sm font-medium">{scheme.name}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fonts tab */}
            <TabsContent value="fonts">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Typographie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fontPairs.map(pair => (
                      <button
                        key={pair.name}
                        onClick={() => updateFonts(pair)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          themeSettings.fonts?.heading === pair.heading
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-semibold mb-1">{pair.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {pair.heading} + {pair.body}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sections tab */}
            <TabsContent value="sections">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sections du site</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sections.map(section => (
                      <div key={section.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{section.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {section.type === "hero" && "Bannière principale"}
                            {section.type === "features" && "Avantages (livraison, etc.)"}
                            {section.type === "products" && "Grille de produits"}
                            {section.type === "about" && "À propos de la boutique"}
                            {section.type === "newsletter" && "Inscription newsletter"}
                            {section.type === "testimonials" && "Avis clients"}
                          </p>
                        </div>
                        <Switch
                          checked={section.enabled}
                          onCheckedChange={(checked) => updateSection(section.type, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content tab */}
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personnaliser le contenu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="heroTitle">Titre principal</Label>
                    <Input
                      id="heroTitle"
                      value={customTexts.heroTitle}
                      onChange={(e) => setCustomTexts(prev => ({ ...prev, heroTitle: e.target.value }))}
                      placeholder={template.heroTitle}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitle">Sous-titre</Label>
                    <Input
                      id="heroSubtitle"
                      value={customTexts.heroSubtitle}
                      onChange={(e) => setCustomTexts(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                      placeholder={template.heroSubtitle}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aboutText">Description "À propos"</Label>
                    <Textarea
                      id="aboutText"
                      value={customTexts.aboutText}
                      onChange={(e) => setCustomTexts(prev => ({ ...prev, aboutText: e.target.value }))}
                      placeholder={template.aboutDescription}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview panel */}
        <div>
          <Card className="overflow-hidden">
            <CardHeader className="py-3 bg-muted/50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Aperçu du site</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[600px] overflow-auto">
              <div className="transform scale-[0.5] origin-top-left w-[200%]">
                <StorefrontPreview
                  boutiqueName={boutique.name}
                  category={boutique.category}
                  themeSettings={mergedTheme}
                  products={products}
                  isPreview
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
