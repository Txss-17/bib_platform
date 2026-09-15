export type StudioPageType =
  | "home"
  | "about"
  | "contact"
  | "faq"
  | "legal"
  | "standard"
  | "product_template";

export type StudioPageMode = "simple" | "rich";

export type StudioSceneType =
  | "hero"
  | "product_showcase"
  | "cta"
  | "story_scrolly"
  | "trust_wall"
  | "faq"
  | "text"
  | "image"
  | "gallery"
  | "testimonials"
  | "features"
  | "contact"
  | "custom";

export type StudioDevice = "desktop" | "tablet" | "mobile";

export type StudioPublicationStatus =
  | "draft"
  | "published"
  | "unpublished";

export type StudioSaveStatus =
  | "idle"
  | "dirty"
  | "saving"
  | "saved"
  | "error";

export interface StudioPageSeo {
  title: string;
  description: string;
  h1: string;
  keywords: string[];
  canonicalUrl?: string | null;
  jsonLd?: Record<string, unknown> | null;
}

export interface StudioPageHero {
  imageUrl?: string | null;
  alt?: string | null;
  overlay?: boolean;
}

export interface StudioPage {
  id: string;
  boutiqueId: string;

  title: string;
  slug: string;

  pageType: StudioPageType;
  mode: StudioPageMode;

  position: number;

  isVisible: boolean;
  showInNav: boolean;

  hero: StudioPageHero;

  content: string;

  seo: StudioPageSeo;

  createdAt: string;
  updatedAt: string;
}

export interface StudioScene {
  id: string;
  pageId: string;

  type: StudioSceneType;

  position: number;

  title?: string | null;

  isVisible: boolean;

  content: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
}

export interface StudioBrandDna {
  tagline?: string | null;
  ambiance?: string | null;
  tone?: string | null;

  heroTitle?: string | null;
  heroSubtitle?: string | null;

  palette?: {
    primary?: string | null;
    secondary?: string | null;
    accent?: string | null;
    background?: string | null;
    foreground?: string | null;
  };

  typography?: {
    heading?: string | null;
    body?: string | null;
  };
}

export interface StudioDraft {
  pages: Record<string, StudioPage>;
  scenes: Record<string, StudioScene>;

  brand: StudioBrandDna;

  activePageId: string | null;
  activeSceneId: string | null;

  saveStatus: StudioSaveStatus;
}
