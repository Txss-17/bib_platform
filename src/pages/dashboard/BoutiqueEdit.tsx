import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, EmptyState, SectionCard } from "@/components/dashboard/shared";
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
import { ArrowLeft, Eye, Save, Loader2, ExternalLink, Type, Palette, Layout, Sparkles, Mail, Plus, GripVertical, Image, Wand2, Upload, Trash2, FileText, Box, Settings as SettingsIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BoutiqueSettingsTab } from "@/components/dashboard/boutique/BoutiqueSettingsTab";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { StorefrontPreview } from "@/components/storefront/StorefrontPreview";
import { getTemplateForCategory, availableSections, animationLevels, heroLayouts, siteTypes, sectionEffects, conversionTemplates, type ThemeSettings, type SectionConfig, type AnimationLevel, type HeroLayout, type SiteType, type SectionEffect, type ConversionTemplate } from "@/lib/boutiqueTemplates";
import { useEmailTemplates, useUpsertEmailTemplate, DEFAULT_TEMPLATES } from "@/hooks/useEmailTemplates";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoutiqueIdentityPanel } from "@/components/dashboard/boutique/BoutiqueIdentityPanel";

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
  { heading: "Playfair Display", body: "Lato", name: "Luxe Éditorial" },
  { heading: "Cormorant Garamond", body: "Nunito Sans", name: "Haute Couture" },
  { heading: "Space Grotesk", body: "Inter", name: "Startup Tech" },
  { heading: "Montserrat", body: "Hind", name: "Sportif Bold" },
  { heading: "DM Serif Display", body: "DM Sans", name: "Magazine Pro" },
  { heading: "Prata", body: "Work Sans", name: "Luxe Minimaliste" },
  { heading: "Archivo Black", body: "Archivo", name: "Streetwear" },
  { heading: "Lora", body: "Source Sans 3", name: "Classique Raffiné" },
  { heading: "Sora", body: "Inter", name: "SaaS Moderne" },
  { heading: "Fraunces", body: "Commissioner", name: "Artisanal Premium" },
];

// Sortable section item
function SortableSectionItem({
  section,
  sectionDef,
  isEnabled,
  onToggle,
  onEffectChange,
  onIntensityChange,
}: {
  section: SectionConfig;
  sectionDef: { type: string; label: string; description: string };
  isEnabled: boolean;
  onToggle: (type: string, enabled: boolean) => void;
  onEffectChange: (type: string, effect: SectionEffect) => void;
  onIntensityChange: (type: string, intensity: "low" | "medium" | "high") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.type,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  const currentEffect = (section.effect || "none") as SectionEffect;
  const currentIntensity = section.effectIntensity || "medium";
  const showIntensity = currentEffect === "tilt" || currentEffect === "parallax";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border/50 hover:bg-muted/30 transition-colors bg-card"
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
            <GripVertical className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground" />
          </button>
          <div>
            <p className="font-medium text-sm">{sectionDef.label}</p>
            <p className="text-xs text-muted-foreground">{sectionDef.description}</p>
          </div>
        </div>
        <Switch checked={isEnabled} onCheckedChange={(checked) => onToggle(section.type, checked)} />
      </div>
      {isEnabled && (
        <div className="px-3 pb-3 pt-1 border-t border-border/40 space-y-2">
          <div className="flex items-center gap-2">
            <Wand2 className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs text-muted-foreground">Effet à l'apparition</Label>
          </div>
          <select
            value={currentEffect}
            onChange={(e) => onEffectChange(section.type, e.target.value as SectionEffect)}
            className="w-full text-xs rounded-md border border-border bg-background px-2 py-1.5"
          >
            {sectionEffects.map(eff => (
              <option key={eff.value} value={eff.value}>{eff.label} — {eff.description}</option>
            ))}
          </select>
          {showIntensity && (
            <div className="flex gap-1">
              {(["low", "medium", "high"] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => onIntensityChange(section.type, lvl)}
                  className={`flex-1 text-xs py-1 rounded border transition-colors ${
                    currentIntensity === lvl
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {lvl === "low" ? "Subtil" : lvl === "medium" ? "Moyen" : "Intense"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BoutiqueEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    colorScheme: "Moderne",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    siteType: "classic",
    animations: true,
    animationLevel: "subtle",
    heroLayout: "text-left",
  });

  const [customTexts, setCustomTexts] = useState({
    heroTitle: "",
    heroSubtitle: "",
    aboutText: "",
    videoUrl: "",
    heroImageUrl: "",
    boutiqueEmail: "",
    aboutImageUrl: "",
    cguText: "",
    cgvText: "",
  });

  const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([]);
  const [tagline, setTagline] = useState("");
  const [voiceTone, setVoiceTone] = useState("");

  // Email template editing state
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isCustomEmail, setIsCustomEmail] = useState(false);
  const [customEmailType, setCustomEmailType] = useState("");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
        .select(`id, public_price, supplier_products (name, image_url)`)
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

  // Email templates
  const { data: emailTemplates = [] } = useEmailTemplates(id);
  const upsertTemplate = useUpsertEmailTemplate();

  // Initialize from boutique data
  useEffect(() => {
    if (boutique?.theme_settings) {
      const settings = (boutique.theme_settings as unknown) as ThemeSettings;
      setThemeSettings({
        colorScheme: settings.colorScheme || "Moderne",
        primaryColor: settings.primaryColor || "#3b82f6",
        secondaryColor: settings.secondaryColor || "#1e40af",
        siteType: settings.siteType || "classic",
        fonts: settings.fonts,
        sections: settings.sections,
        animations: settings.animations !== false,
        animationLevel: settings.animationLevel || "subtle",
        heroLayout: settings.heroLayout || "text-left",
        heroImageUrl: settings.heroImageUrl,
      });
      setCustomTexts({
        heroTitle: settings.customHeroTitle || "",
        heroSubtitle: settings.customHeroSubtitle || "",
        aboutText: settings.customAboutText || "",
        videoUrl: settings.videoUrl || "",
        heroImageUrl: settings.heroImageUrl || "",
        boutiqueEmail: settings.boutiqueEmail || "",
        aboutImageUrl: settings.aboutImageUrl || "",
        cguText: settings.cguText || "",
        cgvText: settings.cgvText || "",
      });
      setFaqItems(settings.faqItems || []);
      setVoiceTone(settings.voiceTone || "");
    } else if (boutique) {
      const template = getTemplateForCategory(boutique.category);
      setThemeSettings({
        colorScheme: "Moderne",
        primaryColor: "#3b82f6",
        secondaryColor: "#1e40af",
        siteType: "classic",
        fonts: template.fonts,
        sections: template.sections,
        animations: true,
        animationLevel: "subtle",
        heroLayout: "text-left",
      });
    }
    if (boutique) {
      setTagline(boutique.tagline || "");
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
        videoUrl: customTexts.videoUrl || undefined,
        heroImageUrl: customTexts.heroImageUrl || undefined,
        boutiqueEmail: customTexts.boutiqueEmail || undefined,
        aboutImageUrl: customTexts.aboutImageUrl || undefined,
        faqItems: faqItems.length > 0 ? faqItems : undefined,
        cguText: customTexts.cguText || undefined,
        cgvText: customTexts.cgvText || undefined,
        voiceTone: voiceTone || undefined,
      };
      const { error } = await supabase
        .from("boutiques")
        .update({ theme_settings: fullSettings as any, tagline: tagline || null })
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

  const updateSectionEffect = (sectionType: string, effect: SectionEffect) => {
    const template = getTemplateForCategory(boutique?.category || "Mode");
    const currentSections = themeSettings.sections || template.sections;
    const updated = currentSections.map(s =>
      s.type === sectionType ? { ...s, effect } : s
    );
    setThemeSettings(prev => ({ ...prev, sections: updated }));
  };

  const updateSectionIntensity = (sectionType: string, effectIntensity: "low" | "medium" | "high") => {
    const template = getTemplateForCategory(boutique?.category || "Mode");
    const currentSections = themeSettings.sections || template.sections;
    const updated = currentSections.map(s =>
      s.type === sectionType ? { ...s, effectIntensity } : s
    );
    setThemeSettings(prev => ({ ...prev, sections: updated }));
  };

  const updateSection = (sectionType: string, enabled: boolean) => {
    const template = getTemplateForCategory(boutique?.category || "Mode");
    const currentSections = themeSettings.sections || template.sections;
    const exists = currentSections.find(s => s.type === sectionType);
    let updatedSections: SectionConfig[];
    if (exists) {
      updatedSections = currentSections.map(s =>
        s.type === sectionType ? { ...s, enabled } : s
      );
    } else {
      updatedSections = [...currentSections, { id: sectionType, type: sectionType as SectionConfig["type"], enabled }];
    }
    setThemeSettings(prev => ({ ...prev, sections: updatedSections }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const template = getTemplateForCategory(boutique?.category || "Mode");
    const currentSections = themeSettings.sections || template.sections;
    const oldIndex = currentSections.findIndex(s => s.type === active.id);
    const newIndex = currentSections.findIndex(s => s.type === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(currentSections, oldIndex, newIndex);
    setThemeSettings(prev => ({ ...prev, sections: reordered }));
  };

  /** Apply a conversion-first template to the boutique (sections + colors + fonts + hero copy). */
  const applyConversionTemplate = (tpl: ConversionTemplate) => {
    setThemeSettings(prev => ({
      ...prev,
      sections: tpl.sections,
      fonts: tpl.fonts,
      heroLayout: tpl.heroLayout,
      // Brand colors stay locked to BIB (marine + gold) — only update if user hasn't set custom.
      primaryColor: tpl.primaryColor,
      secondaryColor: tpl.secondaryColor,
      colorScheme: tpl.label,
    }));
    setCustomTexts(prev => ({
      ...prev,
      heroTitle: tpl.heroTitle,
      heroSubtitle: tpl.heroSubtitle,
    }));
    toast.success(`Template « ${tpl.label} » appliqué — n'oubliez pas d'enregistrer.`);
  };

  /** Add a new section (from availableSections) at the end of the list, enabled by default. */
  const addSection = (type: SectionConfig["type"]) => {
    const template = getTemplateForCategory(boutique?.category || "Mode");
    const currentSections = themeSettings.sections || template.sections;
    if (currentSections.some(s => s.type === type)) {
      toast.info("Cette section est déjà dans la liste — activez-la avec l'interrupteur.");
      return;
    }
    const updated: SectionConfig[] = [
      ...currentSections,
      { id: type, type, enabled: true },
    ];
    setThemeSettings(prev => ({ ...prev, sections: updated }));
    toast.success("Section ajoutée");
  };

  /** Remove a section from the list entirely (different from disabling). */
  const removeSection = (type: SectionConfig["type"]) => {
    const template = getTemplateForCategory(boutique?.category || "Mode");
    const currentSections = themeSettings.sections || template.sections;
    const updated = currentSections.filter(s => s.type !== type);
    setThemeSettings(prev => ({ ...prev, sections: updated }));
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

  const handleEditTemplate = (type: string) => {
    const saved = emailTemplates.find(t => t.type === type);
    const defaultTpl = DEFAULT_TEMPLATES.find(t => t.type === type);
    setEditingTemplate(type);
    setIsCustomEmail(false);
    setEmailSubject(saved?.subject || defaultTpl?.subject || "");
    setEmailBody(saved?.body_html || defaultTpl?.body_html || "");
  };

  const handleNewCustomEmail = () => {
    setEditingTemplate("__new__");
    setIsCustomEmail(true);
    setCustomEmailType("");
    setEmailSubject("");
    setEmailBody(`<h1>Titre de votre email</h1>\n<p>Bonjour {{customer_name}},</p>\n<p>Votre message ici...</p>\n<p>L'équipe {{boutique_name}}</p>`);
  };

  const handleSaveTemplate = async () => {
    if (!id) return;
    const type = isCustomEmail ? (customEmailType || `custom_${Date.now()}`) : editingTemplate;
    if (!type) return;
    try {
      await upsertTemplate.mutateAsync({
        boutique_id: id,
        type,
        subject: emailSubject,
        body_html: emailBody,
      });
      toast.success("Modèle d'email enregistré !");
      setEditingTemplate(null);
      setIsCustomEmail(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde du modèle");
    }
  };

  // Hero image file upload
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `boutique-assets/${id}/hero-${Date.now()}.${fileExt}`;

    toast.loading("Upload en cours...", { id: "hero-upload" });

    const { error: uploadError } = await supabase.storage
      .from("boutique-media")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Erreur d'upload: " + uploadError.message, { id: "hero-upload" });
      return;
    }

    const { data: urlData } = supabase.storage
      .from("boutique-media")
      .getPublicUrl(filePath);

    setCustomTexts(prev => ({ ...prev, heroImageUrl: urlData.publicUrl }));
    toast.success("Image uploadée !", { id: "hero-upload" });
  };

  // About image upload
  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    const fileExt = file.name.split(".").pop();
    const filePath = `boutique-assets/${id}/about-${Date.now()}.${fileExt}`;
    toast.loading("Upload en cours...", { id: "about-upload" });
    const { error: uploadError } = await supabase.storage
      .from("boutique-media")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast.error("Erreur d'upload: " + uploadError.message, { id: "about-upload" });
      return;
    }
    const { data: urlData } = supabase.storage.from("boutique-media").getPublicUrl(filePath);
    setCustomTexts(prev => ({ ...prev, aboutImageUrl: urlData.publicUrl }));
    toast.success("Image uploadée !", { id: "about-upload" });
  };

  const addFaqItem = () => setFaqItems(prev => [...prev, { question: "", answer: "" }]);
  const removeFaqItem = (i: number) => setFaqItems(prev => prev.filter((_, idx) => idx !== i));
  const updateFaqItem = (i: number, field: "question" | "answer", value: string) => {
    setFaqItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          eyebrow="Boutiques"
          title="Chargement…"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Boutiques", href: "/dashboard/boutiques" },
          ]}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!boutique) {
    return (
      <DashboardLayout>
        <PageHeader
          eyebrow="Boutiques"
          title="Boutique introuvable"
          subtitle="Cette boutique n'existe pas ou a été supprimée."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Boutiques", href: "/dashboard/boutiques" },
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
        <SectionCard>
          <EmptyState
            title="Aucune boutique à éditer"
            description="Retournez à la liste pour en créer ou en sélectionner une."
          />
        </SectionCard>
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
    videoUrl: customTexts.videoUrl || undefined,
    heroImageUrl: customTexts.heroImageUrl || undefined,
    boutiqueEmail: customTexts.boutiqueEmail || undefined,
    aboutImageUrl: customTexts.aboutImageUrl || undefined,
    faqItems: faqItems.length > 0 ? faqItems : undefined,
    cguText: customTexts.cguText || undefined,
    cgvText: customTexts.cgvText || undefined,
  };

  // Get custom email templates
  const defaultTypes = DEFAULT_TEMPLATES.map(t => t.type);
  const customTemplates = emailTemplates.filter(t => !defaultTypes.includes(t.type));

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Boutiques"
        title={`Éditer : ${boutique.name}`}
        subtitle="Personnalisez l'apparence et les contenus de votre boutique."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Boutiques", href: "/dashboard/boutiques" },
          { label: boutique.name },
        ]}
      />
      {/* Premium BIB header */}
      <div className="mb-6 rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/30 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard/boutiques">
              <Button variant="ghost" size="sm" className="-ml-2">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Boutiques
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-lg sm:text-xl truncate">
                  {boutique.name}
                </h2>
                <Badge
                  variant={boutique.status === "published" ? "default" : "secondary"}
                  className="text-[10px] uppercase tracking-wide"
                >
                  {boutique.status === "published" ? "Publié" : "Brouillon"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                /boutique/{boutique.slug}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {boutique.status === "published" && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/boutique/${boutique.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir le site
                </a>
              </Button>
            )}
            <Button
              onClick={() => updateBoutique.mutate()}
              disabled={updateBoutique.isPending}
              size="sm"
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
                size="sm"
                className="bg-[hsl(41_55%_52%)] hover:bg-[hsl(41_55%_46%)] text-[hsl(215_55%_14%)]"
                onClick={() => publishBoutique.mutate()}
                disabled={publishBoutique.isPending}
              >
                <Eye className="w-4 h-4 mr-2" />
                Publier
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor panel */}
        <div className="space-y-4">
          <Tabs defaultValue="style" className="w-full">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 h-auto">
              <TabsTrigger value="style" className="gap-1">
                <Box className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Style</span>
              </TabsTrigger>
              <TabsTrigger value="colors" className="gap-1">
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Couleurs</span>
              </TabsTrigger>
              <TabsTrigger value="fonts" className="gap-1">
                <Type className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Polices</span>
              </TabsTrigger>
              <TabsTrigger value="sections" className="gap-1">
                <Layout className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Sections</span>
              </TabsTrigger>
              <TabsTrigger value="hero" className="gap-1">
                <Image className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Hero</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Contenu</span>
              </TabsTrigger>
              <TabsTrigger value="emails" className="gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Emails</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1">
                <SettingsIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Réglages</span>
              </TabsTrigger>
            </TabsList>

            {/* Style/Site type tab */}
            <TabsContent value="style">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Type de site</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {siteTypes.map(st => (
                      <button
                        key={st.value}
                        onClick={() => setThemeSettings(prev => ({ ...prev, siteType: st.value }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          (themeSettings.siteType || "classic") === st.value
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {st.value === "classic" ? (
                            <Layout className="w-6 h-6 text-primary" />
                          ) : (
                            <Box className="w-6 h-6 text-primary" />
                          )}
                          <div>
                            <p className="font-semibold text-sm">{st.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{st.description}</p>
                          </div>
                        </div>
                        {st.value === "3d" && (themeSettings.siteType || "classic") === "3d" && (
                          <div className="mt-3 pt-3 border-t border-border space-y-3">
                            <p className="text-xs text-muted-foreground">Effets inclus :</p>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>✦ Parallaxe au scroll</li>
                              <li>✦ Apparitions avec profondeur 3D</li>
                              <li>✦ Effets de survol interactifs</li>
                              <li>✦ Hero avec lueur animée</li>
                            </ul>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <Label className="text-sm font-medium">Niveau d'animation</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {animationLevels.map(level => (
                        <button
                          key={level.value}
                          onClick={() => setThemeSettings(prev => ({ ...prev, animationLevel: level.value }))}
                          className={`p-2 rounded-lg border text-center transition-all text-xs ${
                            themeSettings.animationLevel === level.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <p className="font-medium">{level.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{level.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live preview comparison */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Aperçu live</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Le rendu se met à jour en direct. Le panneau de droite affiche le mode sélectionné : <strong>{(themeSettings.siteType || "classic") === "3d" ? "3D & Effets" : "Classique"}</strong>.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {siteTypes.map(st => {
                      const isActive = (themeSettings.siteType || "classic") === st.value;
                      return (
                        <button
                          key={st.value}
                          onClick={() => setThemeSettings(prev => ({ ...prev, siteType: st.value }))}
                          className={`group relative rounded-lg border-2 overflow-hidden text-left transition-all ${
                            isActive ? "border-primary shadow-lg" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div
                            className="h-32 relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})`,
                            }}
                          >
                            {st.value === "3d" && (
                              <>
                                <div
                                  className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-white/20 blur-xl animate-pulse"
                                />
                                <div
                                  className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-white/10 blur-lg"
                                  style={{ animation: "float 3s ease-in-out infinite" }}
                                />
                              </>
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
                              <p className="text-xs font-bold drop-shadow" style={{ fontFamily: `'${(themeSettings.fonts?.heading) || "Inter"}', sans-serif` }}>
                                {boutique.name}
                              </p>
                              <div className="flex gap-1 mt-2">
                                {[1,2,3].map(i => (
                                  <div
                                    key={i}
                                    className={`w-6 h-8 rounded bg-white/30 ${st.value === "3d" ? "transform group-hover:rotate-3 transition-transform" : ""}`}
                                    style={st.value === "3d" ? { transform: `perspective(200px) rotateY(${(i-2)*8}deg)` } : {}}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="p-2 bg-card">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold">{st.label}</p>
                              {isActive && <span className="text-[10px] text-primary font-bold">✓ Actif</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3 text-center">
                    💡 Survolez la version 3D pour voir les effets de profondeur
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

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

                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <p className="text-sm font-medium text-foreground">Couleur personnalisée</p>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Primaire</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={themeSettings.primaryColor}
                            onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value, colorScheme: "Custom" }))}
                            className="w-8 h-8 rounded border-0 cursor-pointer"
                          />
                          <Input
                            value={themeSettings.primaryColor}
                            onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value, colorScheme: "Custom" }))}
                            className="font-mono text-xs h-8"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Secondaire</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="color"
                            value={themeSettings.secondaryColor}
                            onChange={(e) => setThemeSettings(prev => ({ ...prev, secondaryColor: e.target.value, colorScheme: "Custom" }))}
                            className="w-8 h-8 rounded border-0 cursor-pointer"
                          />
                          <Input
                            value={themeSettings.secondaryColor}
                            onChange={(e) => setThemeSettings(prev => ({ ...prev, secondaryColor: e.target.value, colorScheme: "Custom" }))}
                            className="font-mono text-xs h-8"
                          />
                        </div>
                      </div>
                    </div>
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
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
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
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-lg leading-tight" style={{ fontFamily: `'${pair.heading}', serif` }}>
                            Titre d'exemple
                          </p>
                          <p className="text-sm text-muted-foreground" style={{ fontFamily: `'${pair.body}', sans-serif` }}>
                            Texte de corps d'exemple pour la boutique
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sections tab with drag-and-drop */}
            <TabsContent value="sections">
              {/* Conversion templates picker */}
              <Card className="mb-4 border-bib-gold/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-bib-gold" />
                    Templates conversion
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Appliquez en 1 clic une mise en page premium pensée pour vendre.
                    Vos contenus existants seront conservés ; les sections seront réinitialisées au modèle choisi.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {conversionTemplates.map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyConversionTemplate(tpl)}
                        className="group text-left rounded-xl border-2 border-border hover:border-bib-gold/60 hover:shadow-md transition-all p-3 bg-card"
                      >
                        {/* Mini wireframe preview */}
                        <div className="aspect-[4/3] rounded-lg bg-bib-ivory border border-border/60 p-2 mb-3 flex flex-col gap-1.5 overflow-hidden">
                          <div className="h-1.5 bg-bib-marine/80 rounded-sm" />
                          <div className="flex-1 rounded bg-bib-marine/10 flex items-center justify-center">
                            <div className="w-1/2 h-2 bg-bib-marine/40 rounded" />
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <div className="h-3 rounded bg-bib-gold/30" />
                            <div className="h-3 rounded bg-bib-marine/15" />
                            <div className="h-3 rounded bg-bib-marine/15" />
                          </div>
                          <div className="h-1 bg-bib-gold rounded-sm" />
                        </div>
                        <p className="font-display font-semibold text-sm text-bib-marine group-hover:text-bib-gold transition-colors">
                          {tpl.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-1">
                          {tpl.description}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-bib-gold font-semibold mt-2">
                          {tpl.sections.filter(s => s.enabled).length} sections
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">Sections du site</CardTitle>
                      <p className="text-xs text-muted-foreground">Glissez-déposez pour réorganiser l'ordre des sections</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Add a section picker */}
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const v = e.target.value as SectionConfig["type"];
                          if (v) {
                            addSection(v);
                            e.target.value = "";
                          }
                        }}
                        className="text-xs rounded-md border border-border bg-background px-2 py-2 hover:border-primary/50 transition-colors"
                      >
                        <option value="">+ Ajouter une section…</option>
                        {availableSections
                          .filter(s => !sections.some(cur => cur.type === s.type))
                          .map(s => (
                            <option key={s.type} value={s.type}>{s.label}</option>
                          ))}
                      </select>
                      <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const template = getTemplateForCategory(boutique?.category || "Mode");
                        const current = themeSettings.sections || template.sections;
                        const cleared = current.map(s => ({ ...s, effect: "none" as SectionEffect, effectIntensity: "medium" as const }));
                        setThemeSettings(prev => ({ ...prev, sections: cleared }));
                        toast.success("Tous les effets ont été réinitialisés");
                      }}
                        className="gap-1.5"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Effets
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sections.map(s => s.type)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {sections.map(section => {
                          const sectionDef = availableSections.find(s => s.type === section.type);
                          if (!sectionDef) return null;
                          return (
                            <SortableSectionItem
                              key={section.type}
                              section={section}
                              sectionDef={sectionDef}
                              isEnabled={section.enabled}
                              onToggle={updateSection}
                              onEffectChange={updateSectionEffect}
                              onIntensityChange={updateSectionIntensity}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Animations level selector */}
                  <div className="mt-6 pt-4 border-t border-border space-y-3">
                    <p className="font-medium text-sm flex items-center gap-2">
                      <Wand2 className="w-4 h-4" /> Niveau d'animations
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {animationLevels.map(level => (
                        <button
                          key={level.value}
                          onClick={() => setThemeSettings(prev => ({ ...prev, animationLevel: level.value, animations: level.value !== "none" }))}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            themeSettings.animationLevel === level.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <p className="font-medium text-xs">{level.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{level.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hero layout tab */}
            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mise en page Hero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {heroLayouts.map(layout => (
                      <button
                        key={layout.value}
                        onClick={() => setThemeSettings(prev => ({ ...prev, heroLayout: layout.value }))}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          themeSettings.heroLayout === layout.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-medium text-xs">{layout.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{layout.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border space-y-3">
                    <Label>Image Hero</Label>
                    <div className="flex gap-2">
                      <Input
                        value={customTexts.heroImageUrl}
                        onChange={(e) => setCustomTexts(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleHeroImageUpload} />
                        <Button variant="outline" size="icon" asChild>
                          <span><Upload className="w-4 h-4" /></span>
                        </Button>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Collez une URL ou uploadez une image. Utilisé pour les mises en page avec image.
                    </p>
                    {customTexts.heroImageUrl && (
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img src={customTexts.heroImageUrl} alt="Hero preview" className="w-full h-32 object-cover" />
                      </div>
                    )}
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
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
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

                  {/* About image upload */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <Label>Image "À propos"</Label>
                    <div className="flex gap-2">
                      <Input
                        value={customTexts.aboutImageUrl}
                        onChange={(e) => setCustomTexts(prev => ({ ...prev, aboutImageUrl: e.target.value }))}
                        placeholder="https://example.com/about.jpg"
                        className="flex-1"
                      />
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleAboutImageUpload} />
                        <Button variant="outline" size="icon" asChild>
                          <span><Upload className="w-4 h-4" /></span>
                        </Button>
                      </label>
                    </div>
                    {customTexts.aboutImageUrl && (
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img src={customTexts.aboutImageUrl} alt="About preview" className="w-full h-24 object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="videoUrl">URL vidéo (YouTube / Vimeo)</Label>
                    <Input
                      id="videoUrl"
                      value={customTexts.videoUrl}
                      onChange={(e) => setCustomTexts(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="mt-1"
                    />
                  </div>

                  {/* FAQ Editor */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Questions FAQ
                      </Label>
                      <Button size="sm" variant="outline" onClick={addFaqItem} className="gap-1">
                        <Plus className="w-3 h-3" /> Ajouter
                      </Button>
                    </div>
                    {faqItems.length === 0 && (
                      <p className="text-xs text-muted-foreground">Aucune question personnalisée. Les FAQ par défaut seront affichées.</p>
                    )}
                    {faqItems.map((item, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Question {i + 1}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFaqItem(i)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                        <Input
                          value={item.question}
                          onChange={(e) => updateFaqItem(i, "question", e.target.value)}
                          placeholder="Votre question..."
                          className="text-sm"
                        />
                        <Textarea
                          value={item.answer}
                          onChange={(e) => updateFaqItem(i, "answer", e.target.value)}
                          placeholder="Votre réponse..."
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  {/* CGU / CGV */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <Label htmlFor="cgvText">Conditions Générales de Vente (CGV)</Label>
                    <Textarea
                      id="cgvText"
                      value={customTexts.cgvText}
                      onChange={(e) => setCustomTexts(prev => ({ ...prev, cgvText: e.target.value }))}
                      placeholder="Entrez vos conditions générales de vente..."
                      rows={4}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cguText">Conditions Générales d'Utilisation (CGU)</Label>
                    <Textarea
                      id="cguText"
                      value={customTexts.cguText}
                      onChange={(e) => setCustomTexts(prev => ({ ...prev, cguText: e.target.value }))}
                      placeholder="Entrez vos conditions générales d'utilisation..."
                      rows={4}
                      className="text-sm"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Label htmlFor="boutiqueEmail">Email de la boutique</Label>
                    <Input
                      id="boutiqueEmail"
                      type="email"
                      value={customTexts.boutiqueEmail}
                      onChange={(e) => setCustomTexts(prev => ({ ...prev, boutiqueEmail: e.target.value }))}
                      placeholder="contact@maboutique.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Utilisé comme adresse d'expédition des emails de confirmation de commande aux clients.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emails tab */}
            <TabsContent value="emails">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Modèles d'emails</CardTitle>
                    {!editingTemplate && (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={handleNewCustomEmail}>
                        <Plus className="w-4 h-4" />
                        Nouveau
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingTemplate ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {isCustomEmail 
                            ? "Nouvel email personnalisé" 
                            : (DEFAULT_TEMPLATES.find(t => t.type === editingTemplate)?.label || editingTemplate)}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingTemplate(null); setIsCustomEmail(false); }}>
                          ← Retour
                        </Button>
                      </div>

                      {isCustomEmail && (
                        <div>
                          <Label>Identifiant du modèle</Label>
                          <Input
                            value={customEmailType}
                            onChange={(e) => setCustomEmailType(e.target.value.replace(/[^a-z0-9_]/g, ""))}
                            placeholder="ex: relance_panier"
                            className="mt-1 font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Lettres minuscules, chiffres et underscore uniquement.</p>
                        </div>
                      )}

                      <div>
                        <Label>Objet de l'email</Label>
                        <Input
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Corps de l'email (HTML)</Label>
                        <Textarea
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="mt-1 font-mono text-xs"
                          rows={12}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Variables : {"{{boutique_name}}"}, {"{{order_number}}"}, {"{{product_name}}"}, {"{{amount}}"}, {"{{customer_name}}"}
                        </p>
                      </div>

                      {/* Preview */}
                      <div>
                        <Label>Aperçu</Label>
                        <div
                          className="mt-1 p-4 border border-border rounded-lg bg-white text-sm max-h-60 overflow-auto"
                          dangerouslySetInnerHTML={{
                            __html: emailBody
                              .replace(/\{\{boutique_name\}\}/g, boutique.name)
                              .replace(/\{\{order_number\}\}/g, "LKS26-ABC123")
                              .replace(/\{\{product_name\}\}/g, "Produit Exemple")
                              .replace(/\{\{amount\}\}/g, "49.90")
                              .replace(/\{\{customer_name\}\}/g, "Jean Dupont"),
                          }}
                        />
                      </div>

                      <Button
                        onClick={handleSaveTemplate}
                        disabled={upsertTemplate.isPending || (isCustomEmail && !customEmailType)}
                        className="w-full"
                      >
                        {upsertTemplate.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Enregistrer le modèle
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-4">
                        Personnalisez les emails envoyés à vos clients. Utilisez le bouton <strong>+ Nouveau</strong> pour créer un email personnalisé.
                      </p>

                      {/* Email activation config */}
                      <div className="p-3 rounded-lg border border-border/50 bg-muted/20 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Envoi automatique après commande</p>
                            <p className="text-xs text-muted-foreground">Envoyer un email de confirmation au client automatiquement</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>

                      {/* Default templates */}
                      {DEFAULT_TEMPLATES.map(tpl => {
                        const saved = emailTemplates.find(t => t.type === tpl.type);
                        return (
                          <button
                            key={tpl.type}
                            onClick={() => handleEditTemplate(tpl.type)}
                            className="w-full p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{tpl.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[250px]">
                                  {saved ? saved.subject : tpl.subject}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {saved && (
                                  <span className="text-xs bg-success/15 text-success px-2 py-0.5 rounded-full">
                                    Personnalisé
                                  </span>
                                )}
                                <Sparkles className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {/* Custom templates */}
                      {customTemplates.length > 0 && (
                        <>
                          <div className="border-t border-border pt-3 mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">EMAILS PERSONNALISÉS</p>
                          </div>
                          {customTemplates.map(tpl => (
                            <button
                              key={tpl.type}
                              onClick={() => handleEditTemplate(tpl.type)}
                              className="w-full p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{tpl.type}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[250px]">{tpl.subject}</p>
                                </div>
                                <span className="text-xs bg-info/15 text-info px-2 py-0.5 rounded-full">
                                  Custom
                                </span>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings tab — SEO per boutique, legal info, commerce, team, danger zone */}
            <TabsContent value="settings">
              {id && <BoutiqueSettingsTab boutiqueId={id} />}
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
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
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
