import { useState } from "react";
import { Palette, Type, Eye, ShoppingCart, Home, Package, Music, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/dashboard/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COLOR_PALETTES = [
  { name: "Marine BIB", primary: "#1B2A41", secondary: "#C9A961" },
  { name: "Moderne", primary: "#3B82F6", secondary: "#1E40AF" },
  { name: "Nature", primary: "#16A34A", secondary: "#15803D" },
  { name: "Élégant", primary: "#8B5CF6", secondary: "#6D28D9" },
  { name: "Chaleureux", primary: "#F97316", secondary: "#C2410C" },
  { name: "Minimaliste", primary: "#374151", secondary: "#1F2937" },
  { name: "Terracotta", primary: "#B45309", secondary: "#92400E" },
  { name: "Rose", primary: "#DB2777", secondary: "#9D174D" },
];

const FONT_PAIRS = [
  { heading: "Playfair Display", body: "Inter", name: "Éditorial" },
  { heading: "Cormorant Garamond", body: "Nunito Sans", name: "Haute Couture" },
  { heading: "Space Grotesk", body: "Inter", name: "Tech moderne" },
  { heading: "Montserrat", body: "Inter", name: "Bold & Sport" },
  { heading: "DM Serif Display", body: "DM Sans", name: "Magazine" },
  { heading: "Archivo Black", body: "Archivo", name: "Streetwear" },
];

interface Props {
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  boutiqueName: string;
  logoUrl?: string | null;
  onLogoChange?: (url: string) => void;
  tagline: string;
  onTaglineChange: (val: string) => void;
  voiceTone: string;
  onVoiceToneChange: (val: string) => void;
}

/**
 * Identity editor: logo, palette, typography, voice — with live preview of
 * the 3 critical surfaces (Home, Product, Checkout).
 */
export function BoutiqueIdentityPanel({
  themeSettings,
  setThemeSettings,
  boutiqueName,
  logoUrl,
  tagline,
  onTaglineChange,
  voiceTone,
  onVoiceToneChange,
}: Props) {
  const primary = themeSettings.primaryColor || "#1B2A41";
  const secondary = themeSettings.secondaryColor || "#C9A961";
  const headingFont = themeSettings.fonts?.heading || "Playfair Display";

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
      {/* Editor */}
      <div className="space-y-4">
        <SectionCard
          title="Identité visuelle"
          description="Le socle de votre marque, propagé partout"
          icon={<Palette className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Tagline (sous le nom de la marque)</Label>
              <Input
                value={tagline}
                onChange={(e) => onTaglineChange(e.target.value)}
                placeholder="Ex: La beauté éthique au quotidien"
                maxLength={80}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Palette de couleurs</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PALETTES.map((p) => {
                  const active = themeSettings.colorScheme === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        setThemeSettings((prev) => ({
                          ...prev,
                          colorScheme: p.name,
                          primaryColor: p.primary,
                          secondaryColor: p.secondary,
                        }))
                      }
                      className={`group rounded-lg border-2 p-1.5 transition-all ${
                        active ? "border-bib-gold scale-105" : "border-transparent hover:border-border"
                      }`}
                      aria-label={`Palette ${p.name}`}
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="h-6 flex-1 rounded" style={{ backgroundColor: p.primary }} />
                        <span className="h-6 flex-1 rounded" style={{ backgroundColor: p.secondary }} />
                      </div>
                      <p className="text-[10px] text-center text-muted-foreground truncate">{p.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Couleur principale</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primary}
                    onChange={(e) =>
                      setThemeSettings((prev) => ({ ...prev, primaryColor: e.target.value }))
                    }
                    className="h-9 w-12 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={primary}
                    onChange={(e) =>
                      setThemeSettings((prev) => ({ ...prev, primaryColor: e.target.value }))
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Couleur secondaire</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={secondary}
                    onChange={(e) =>
                      setThemeSettings((prev) => ({ ...prev, secondaryColor: e.target.value }))
                    }
                    className="h-9 w-12 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={secondary}
                    onChange={(e) =>
                      setThemeSettings((prev) => ({ ...prev, secondaryColor: e.target.value }))
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Typographie"
          description="Polices appliquées sur tous les écrans"
          icon={<Type className="w-4 h-4" />}
        >
          <div className="space-y-2">
            {FONT_PAIRS.map((pair) => {
              const active = themeSettings.fonts?.heading === pair.heading;
              return (
                <button
                  key={pair.name}
                  type="button"
                  onClick={() =>
                    setThemeSettings((prev) => ({
                      ...prev,
                      fonts: { heading: pair.heading, body: pair.body },
                    }))
                  }
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    active ? "border-bib-gold bg-bib-gold/5" : "border-border hover:border-bib-gold/40"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span style={{ fontFamily: pair.heading }} className="text-base font-semibold">
                      {pair.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {pair.heading} + {pair.body}
                    </span>
                  </div>
                  <p style={{ fontFamily: pair.body }} className="text-xs text-muted-foreground mt-1">
                    Le quick brown fox jumps over the lazy dog.
                  </p>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Ton de voix"
          description="Inspiration éditoriale pour vos textes et emails"
          icon={<Eye className="w-4 h-4" />}
        >
          <Textarea
            value={voiceTone}
            onChange={(e) => onVoiceToneChange(e.target.value)}
            placeholder="Ex: chaleureux, expert, complice, premium mais accessible…"
            rows={3}
          />
        </SectionCard>

        <AmbientAudioSection
          themeSettings={themeSettings}
          setThemeSettings={setThemeSettings}
        />
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <SectionCard
          title="Aperçu sur 3 écrans"
          description="Accueil · Page produit · Checkout"
          icon={<Eye className="w-4 h-4" />}
        >
          <Tabs defaultValue="home" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9">
              <TabsTrigger value="home" className="text-xs gap-1"><Home className="h-3 w-3" /> Accueil</TabsTrigger>
              <TabsTrigger value="product" className="text-xs gap-1"><Package className="h-3 w-3" /> Produit</TabsTrigger>
              <TabsTrigger value="checkout" className="text-xs gap-1"><ShoppingCart className="h-3 w-3" /> Checkout</TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="mt-3">
              <PreviewFrame primary={primary} secondary={secondary} headingFont={headingFont}>
                <PreviewHome name={boutiqueName} tagline={tagline} logo={logoUrl} primary={primary} secondary={secondary} headingFont={headingFont} />
              </PreviewFrame>
            </TabsContent>
            <TabsContent value="product" className="mt-3">
              <PreviewFrame primary={primary} secondary={secondary} headingFont={headingFont}>
                <PreviewProduct name={boutiqueName} primary={primary} secondary={secondary} headingFont={headingFont} />
              </PreviewFrame>
            </TabsContent>
            <TabsContent value="checkout" className="mt-3">
              <PreviewFrame primary={primary} secondary={secondary} headingFont={headingFont}>
                <PreviewCheckout name={boutiqueName} primary={primary} secondary={secondary} headingFont={headingFont} />
              </PreviewFrame>
            </TabsContent>
          </Tabs>
        </SectionCard>
      </div>
    </div>
  );
}

/* ---------- Mini-previews (no external state, pure props) ---------- */

function PreviewFrame({
  primary,
  children,
}: {
  primary: string;
  secondary: string;
  headingFont: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/30">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="ml-2 text-[10px] text-muted-foreground font-mono">votre-boutique.bib.shop</span>
      </div>
      <div className="text-foreground" style={{ ["--brand-primary" as any]: primary }}>
        {children}
      </div>
    </div>
  );
}

function PreviewHome({
  name, tagline, logo, primary, secondary, headingFont,
}: { name: string; tagline: string; logo?: string | null; primary: string; secondary: string; headingFont: string }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: primary }}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <span style={{ fontFamily: headingFont, color: primary }} className="font-semibold text-sm">{name || "Ma marque"}</span>
        </div>
        <div className="h-5 w-5 rounded-full" style={{ background: primary }} />
      </div>
      <div className="aspect-[16/8] rounded-lg flex flex-col justify-end p-3" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}>
        <p style={{ fontFamily: headingFont }} className="text-white text-base font-bold leading-tight">{tagline || "Votre tagline ici"}</p>
        <span className="mt-1 inline-flex w-fit text-[10px] font-semibold px-2 py-0.5 rounded text-white" style={{ background: secondary }}>
          Découvrir →
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square rounded bg-muted/60" />
        ))}
      </div>
    </div>
  );
}

function PreviewProduct({
  name, primary, secondary, headingFont,
}: { name: string; primary: string; secondary: string; headingFont: string }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b">
        <span style={{ fontFamily: headingFont, color: primary }} className="font-semibold text-sm">{name || "Ma marque"}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="aspect-square rounded-lg bg-muted/60" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Catégorie</p>
          <p style={{ fontFamily: headingFont }} className="text-base font-bold mt-0.5">Produit phare</p>
          <p style={{ color: primary }} className="text-lg font-bold mt-1">39,00 €</p>
          <p className="text-[10px] text-muted-foreground mt-1">Description courte du produit, en deux lignes maximum.</p>
          <button
            className="mt-3 w-full text-white text-xs font-semibold py-2 rounded"
            style={{ background: primary }}
          >
            Ajouter au panier
          </button>
          <button
            className="mt-1.5 w-full text-xs font-semibold py-2 rounded border"
            style={{ borderColor: secondary, color: secondary }}
          >
            Acheter maintenant
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewCheckout({
  name, primary, secondary, headingFont,
}: { name: string; primary: string; secondary: string; headingFont: string }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b">
        <span style={{ fontFamily: headingFont, color: primary }} className="font-semibold text-sm">{name || "Ma marque"}</span>
        <span className="text-[10px] text-muted-foreground">Paiement sécurisé</span>
      </div>
      <div className="space-y-2">
        <p style={{ fontFamily: headingFont }} className="font-bold text-sm">Finalisez votre commande</p>
        <div className="space-y-1.5">
          <div className="h-7 rounded bg-muted/40 border border-border" />
          <div className="h-7 rounded bg-muted/40 border border-border" />
          <div className="grid grid-cols-2 gap-1.5">
            <div className="h-7 rounded bg-muted/40 border border-border" />
            <div className="h-7 rounded bg-muted/40 border border-border" />
          </div>
        </div>
        <div className="rounded p-2 text-[10px]" style={{ background: `${primary}11`, color: primary }}>
          Total : <strong>39,00 €</strong> · Livraison incluse
        </div>
        <button className="w-full text-white text-xs font-bold py-2.5 rounded" style={{ background: secondary }}>
          Payer 39,00 €
        </button>
      </div>
    </div>
  );
}

/* ---------- Ambient audio uploader ---------- */

function AmbientAudioSection({
  themeSettings,
  setThemeSettings,
}: {
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<React.SetStateAction<ThemeSettings>>;
}) {import { useState } from "react";
import {
  Palette,
  Type,
  Eye,
  ShoppingCart,
  Home,
  Package,
  Music,
  Loader2,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/dashboard/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COLOR_PALETTES = [
  {
    name: "Marine BIB",
    primary: "#1B2A41",
    secondary: "#C9A961",
  },
  {
    name: "Moderne",
    primary: "#3B82F6",
    secondary: "#1E40AF",
  },
  {
    name: "Nature",
    primary: "#16A34A",
    secondary: "#15803D",
  },
  {
    name: "Élégant",
    primary: "#8B5CF6",
    secondary: "#6D28D9",
  },
  {
    name: "Chaleureux",
    primary: "#F97316",
    secondary: "#C2410C",
  },
  {
    name: "Minimaliste",
    primary: "#374151",
    secondary: "#1F2937",
  },
  {
    name: "Terracotta",
    primary: "#B45309",
    secondary: "#92400E",
  },
  {
    name: "Rose",
    primary: "#DB2777",
    secondary: "#9D174D",
  },
];

const FONT_PAIRS = [
  {
    heading: "Playfair Display",
    body: "Inter",
    name: "Éditorial",
  },
  {
    heading: "Cormorant Garamond",
    body: "Nunito Sans",
    name: "Haute Couture",
  },
  {
    heading: "Space Grotesk",
    body: "Inter",
    name: "Tech moderne",
  },
  {
    heading: "Montserrat",
    body: "Inter",
    name: "Bold & Sport",
  },
  {
    heading: "DM Serif Display",
    body: "DM Sans",
    name: "Magazine",
  },
  {
    heading: "Archivo Black",
    body: "Archivo",
    name: "Streetwear",
  },
];

interface Props {
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<
    React.SetStateAction<ThemeSettings>
  >;
  boutiqueName: string;
  logoUrl?: string | null;
  onLogoChange?: (url: string) => void;
  tagline: string;
  onTaglineChange: (value: string) => void;
  voiceTone: string;
  onVoiceToneChange: (value: string) => void;
}

/**
 * Éditeur d'identité : logo, palette, typographie et ton de voix.
 *
 * Les modifications sont prévisualisées sur trois surfaces essentielles :
 * accueil, produit et checkout.
 */
export function BoutiqueIdentityEditor({
  themeSettings,
  setThemeSettings,
  boutiqueName,
  logoUrl,
  tagline,
  onTaglineChange,
  voiceTone,
  onVoiceToneChange,
}: Props) {
  const primary =
    themeSettings.primaryColor || "#1B2A41";

  const secondary =
    themeSettings.secondaryColor || "#C9A961";

  const headingFont =
    themeSettings.fonts?.heading || "Playfair Display";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      {/* Édition */}
      <div className="space-y-4">
        <SectionCard
          title="Identité visuelle"
          description="Le socle de votre marque, propagé partout"
          icon={<Palette className="h-4 w-4" />}
        >
          <div className="space-y-4">
            {/* Tagline */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Tagline (sous le nom de la marque)
              </Label>

              <Input
                value={tagline}
                onChange={(event) =>
                  onTaglineChange(event.target.value)
                }
                placeholder="Ex: La beauté éthique au quotidien"
                maxLength={80}
              />
            </div>

            {/* Palette */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Palette de couleurs
              </Label>

              <div className="grid grid-cols-4 gap-2">
                {COLOR_PALETTES.map((palette) => {
                  const active =
                    themeSettings.colorScheme ===
                    palette.name;

                  return (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() =>
                        setThemeSettings((previous) => ({
                          ...previous,
                          colorScheme: palette.name,
                          primaryColor: palette.primary,
                          secondaryColor:
                            palette.secondary,
                        }))
                      }
                      className={`group rounded-lg border-2 p-1.5 transition-all ${
                        active
                          ? "scale-105 border-bib-gold"
                          : "border-transparent hover:border-border"
                      }`}
                      aria-label={`Palette ${palette.name}`}
                    >
                      <div className="mb-1 flex gap-1">
                        <span
                          className="h-6 flex-1 rounded"
                          style={{
                            backgroundColor:
                              palette.primary,
                          }}
                        />

                        <span
                          className="h-6 flex-1 rounded"
                          style={{
                            backgroundColor:
                              palette.secondary,
                          }}
                        />
                      </div>

                      <p className="truncate text-center text-[10px] text-muted-foreground">
                        {palette.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Couleurs personnalisées */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Couleur principale
                </Label>

                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primary}
                    onChange={(event) =>
                      setThemeSettings((previous) => ({
                        ...previous,
                        primaryColor:
                          event.target.value,
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-border"
                  />

                  <Input
                    value={primary}
                    onChange={(event) =>
                      setThemeSettings((previous) => ({
                        ...previous,
                        primaryColor:
                          event.target.value,
                      }))
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Couleur secondaire
                </Label>

                <div className="flex gap-2">
                  <input
                    type="color"
                    value={secondary}
                    onChange={(event) =>
                      setThemeSettings((previous) => ({
                        ...previous,
                        secondaryColor:
                          event.target.value,
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-border"
                  />

                  <Input
                    value={secondary}
                    onChange={(event) =>
                      setThemeSettings((previous) => ({
                        ...previous,
                        secondaryColor:
                          event.target.value,
                      }))
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Typographie */}
        <SectionCard
          title="Typographie"
          description="Polices appliquées sur tous les écrans"
          icon={<Type className="h-4 w-4" />}
        >
          <div className="space-y-2">
            {FONT_PAIRS.map((pair) => {
              const active =
                themeSettings.fonts?.heading ===
                pair.heading;

              return (
                <button
                  key={pair.name}
                  type="button"
                  onClick={() =>
                    setThemeSettings((previous) => ({
                      ...previous,
                      fonts: {
                        heading: pair.heading,
                        body: pair.body,
                      },
                    }))
                  }
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    active
                      ? "border-bib-gold bg-bib-gold/5"
                      : "border-border hover:border-bib-gold/40"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      style={{
                        fontFamily: pair.heading,
                      }}
                      className="text-base font-semibold"
                    >
                      {pair.name}
                    </span>

                    <span className="text-[10px] text-muted-foreground">
                      {pair.heading} + {pair.body}
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: pair.body,
                    }}
                    className="mt-1 text-xs text-muted-foreground"
                  >
                    Le quick brown fox jumps over the lazy dog.
                  </p>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Ton de voix */}
        <SectionCard
          title="Ton de voix"
          description="Inspiration éditoriale pour vos textes et emails"
          icon={<Eye className="h-4 w-4" />}
        >
          <Textarea
            value={voiceTone}
            onChange={(event) =>
              onVoiceToneChange(event.target.value)
            }
            placeholder="Ex: chaleureux, expert, complice, premium mais accessible…"
            rows={3}
          />
        </SectionCard>

        {/* Ambiance sonore */}
        <AmbientAudioSection
          themeSettings={themeSettings}
          setThemeSettings={setThemeSettings}
        />
      </div>

      {/* Aperçu en direct */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <SectionCard
          title="Aperçu sur 3 écrans"
          description="Accueil · Page produit · Checkout"
          icon={<Eye className="h-4 w-4" />}
        >
          <Tabs
            defaultValue="home"
            className="w-full"
          >
            <TabsList className="grid h-9 w-full grid-cols-3">
              <TabsTrigger
                value="home"
                className="gap-1 text-xs"
              >
                <Home className="h-3 w-3" />
                Accueil
              </TabsTrigger>

              <TabsTrigger
                value="product"
                className="gap-1 text-xs"
              >
                <Package className="h-3 w-3" />
                Produit
              </TabsTrigger>

              <TabsTrigger
                value="checkout"
                className="gap-1 text-xs"
              >
                <ShoppingCart className="h-3 w-3" />
                Checkout
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="home"
              className="mt-3"
            >
              <PreviewFrame
                primary={primary}
                secondary={secondary}
                headingFont={headingFont}
              >
                <PreviewHome
                  name={boutiqueName}
                  tagline={tagline}
                  logo={logoUrl}
                  primary={primary}
                  secondary={secondary}
                  headingFont={headingFont}
                />
              </PreviewFrame>
            </TabsContent>

            <TabsContent
              value="product"
              className="mt-3"
            >
              <PreviewFrame
                primary={primary}
                secondary={secondary}
                headingFont={headingFont}
              >
                <PreviewProduct
                  name={boutiqueName}
                  primary={primary}
                  secondary={secondary}
                  headingFont={headingFont}
                />
              </PreviewFrame>
            </TabsContent>

            <TabsContent
              value="checkout"
              className="mt-3"
            >
              <PreviewFrame
                primary={primary}
                secondary={secondary}
                headingFont={headingFont}
              >
                <PreviewCheckout
                  name={boutiqueName}
                  primary={primary}
                  secondary={secondary}
                  headingFont={headingFont}
                />
              </PreviewFrame>
            </TabsContent>
          </Tabs>
        </SectionCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Aperçu miniature                                                           */
/* -------------------------------------------------------------------------- */

function PreviewFrame({
  primary,
  secondary,
  headingFont,
  children,
}: {
  primary: string;
  secondary: string;
  headingFont: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />

        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
          votre-boutique.bib.shop
        </span>
      </div>

      <div
        className="text-foreground"
        style={
          {
            "--brand-primary": primary,
            "--brand-secondary": secondary,
            "--brand-heading-font": headingFont,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Aperçu accueil                                                             */
/* -------------------------------------------------------------------------- */

function PreviewHome({
  name,
  tagline,
  logo,
  primary,
  secondary,
  headingFont,
}: {
  name: string;
  tagline: string;
  logo?: string | null;
  primary: string;
  secondary: string;
  headingFont: string;
}) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          {logo ? (
            <img
              src={logo}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{
                background: primary,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <span
            style={{
              fontFamily: headingFont,
              color: primary,
            }}
            className="text-sm font-semibold"
          >
            {name || "Ma marque"}
          </span>
        </div>

        <div
          className="h-5 w-5 rounded-full"
          style={{
            background: primary,
          }}
        />
      </div>

      <div
        className="flex aspect-[16/8] flex-col justify-end rounded-lg p-3"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        }}
      >
        <p
          style={{
            fontFamily: headingFont,
          }}
          className="text-base font-bold leading-tight text-white"
        >
          {tagline || "Votre tagline ici"}
        </p>

        <span
          className="mt-1 inline-flex w-fit rounded px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{
            background: secondary,
          }}
        >
          Découvrir →
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="aspect-square rounded bg-muted/60"
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Aperçu produit                                                             */
/* -------------------------------------------------------------------------- */

function PreviewProduct({
  name,
  primary,
  secondary,
  headingFont,
}: {
  name: string;
  primary: string;
  secondary: string;
  headingFont: string;
}) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2 border-b pb-2">
        <span
          style={{
            fontFamily: headingFont,
            color: primary,
          }}
          className="text-sm font-semibold"
        >
          {name || "Ma marque"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="aspect-square rounded-lg bg-muted/60" />

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Catégorie
          </p>

          <p
            style={{
              fontFamily: headingFont,
            }}
            className="mt-0.5 text-base font-bold"
          >
            Produit phare
          </p>

          <p
            style={{
              color: primary,
            }}
            className="mt-1 text-lg font-bold"
          >
            39,00 €
          </p>

          <p className="mt-1 text-[10px] text-muted-foreground">
            Description courte du produit, en deux lignes maximum.
          </p>

          <button
            type="button"
            className="mt-3 w-full rounded py-2 text-xs font-semibold text-white"
            style={{
              background: primary,
            }}
          >
            Ajouter au panier
          </button>

          <button
            type="button"
            className="mt-1.5 w-full rounded border py-2 text-xs font-semibold"
            style={{
              borderColor: secondary,
              color: secondary,
            }}
          >
            Acheter maintenant
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Aperçu checkout                                                            */
/* -------------------------------------------------------------------------- */

function PreviewCheckout({
  name,
  primary,
  secondary,
  headingFont,
}: {
  name: string;
  primary: string;
  secondary: string;
  headingFont: string;
}) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between border-b pb-2">
        <span
          style={{
            fontFamily: headingFont,
            color: primary,
          }}
          className="text-sm font-semibold"
        >
          {name || "Ma marque"}
        </span>

        <span className="text-[10px] text-muted-foreground">
          Paiement sécurisé
        </span>
      </div>

      <div className="space-y-2">
        <p
          style={{
            fontFamily: headingFont,
          }}
          className="text-sm font-bold"
        >
          Finalisez votre commande
        </p>

        <div className="space-y-1.5">
          <div className="h-7 rounded border border-border bg-muted/40" />
          <div className="h-7 rounded border border-border bg-muted/40" />

          <div className="grid grid-cols-2 gap-1.5">
            <div className="h-7 rounded border border-border bg-muted/40" />
            <div className="h-7 rounded border border-border bg-muted/40" />
          </div>
        </div>

        <div
          className="rounded p-2 text-[10px]"
          style={{
            background: `${primary}11`,
            color: primary,
          }}
        >
          Total : <strong>39,00 €</strong> · Livraison incluse
        </div>

        <button
          type="button"
          className="w-full rounded py-2.5 text-xs font-bold text-white"
          style={{
            background: secondary,
          }}
        >
          Payer 39,00 €
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Ambiance sonore                                                            */
/* -------------------------------------------------------------------------- */

function AmbientAudioSection({
  themeSettings,
  setThemeSettings,
}: {
  themeSettings: ThemeSettings;
  setThemeSettings: React.Dispatch<
    React.SetStateAction<ThemeSettings>
  >;
}) {
  const [uploading, setUploading] = useState(false);

  const url = themeSettings.backgroundAudioUrl;

  const volume =
    themeSettings.backgroundAudioVolume ?? 0.4;

  const handleUpload = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast.error(
        "Fichier trop lourd (max 8 Mo). Privilégiez un MP3 court (boucle).",
      );
      return;
    }

    setUploading(true);

    try {
      const { data: userData } =
        await supabase.auth.getUser();

      const userId = userData?.user?.id;

      if (!userId) {
        throw new Error("Session expirée");
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        "mp3";

      const path =
        `${userId}/audio/${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage
        .from("boutique-media")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } =
        supabase.storage
          .from("boutique-media")
          .getPublicUrl(path);

      setThemeSettings((previous) => ({
        ...previous,
        backgroundAudioUrl: data.publicUrl,
      }));

      toast.success("Ambiance sonore chargée");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Upload impossible",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <SectionCard
      title="Ambiance sonore"
      description="Une boucle douce, jouée seulement après clic du visiteur"
      icon={<Music className="h-4 w-4" />}
    >
      <div className="space-y-3">
        {url ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
            <audio
              src={url}
              controls
              className="h-8 flex-1"
            />

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Retirer l'ambiance sonore"
              onClick={() =>
                setThemeSettings((previous) => ({
                  ...previous,
                  backgroundAudioUrl: undefined,
                }))
              }
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Aucune ambiance. Importez un MP3 court
            (≤ 8 Mo, idéalement en boucle).
          </p>
        )}

        <div>
          <Label
            htmlFor="ambient-audio-input"
            className="sr-only"
          >
            Importer un fichier audio
          </Label>

          <input
            id="ambient-audio-input"
            type="file"
            accept="audio/mpeg,audio/mp3,audio/ogg,audio/wav"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void handleUpload(file);
              }

              event.target.value = "";
            }}
          />

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() =>
              document
                .getElementById("ambient-audio-input")
                ?.click()
            }
          >
            {uploading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Envoi…
              </>
            ) : (
              <>
                {url
                  ? "Remplacer le fichier"
                  : "Importer un fichier audio"}
              </>
            )}
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">
            Volume par défaut · {Math.round(volume * 100)}%
          </Label>

          <Slider
            value={[Math.round(volume * 100)]}
            min={0}
            max={100}
            step={5}
            onValueChange={(value) =>
              setThemeSettings((previous) => ({
                ...previous,
                backgroundAudioVolume:
                  (value[0] ?? 40) / 100,
              }))
            }
          />
        </div>
      </div>
    </SectionCard>
  );
}