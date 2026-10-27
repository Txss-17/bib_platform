import { getUiLanguage } from "@/lib/uiLanguage";
// Labels for BIB-defined choices; the stored values and free-form answers are preserved.
const labels: Record<string, Record<string, string>> = {
  personality: {
    Élégante: "Elegant",
    Audacieuse: "Bold",
    Chaleureuse: "Warm",
    Minimaliste: "Minimalist",
    Créative: "Creative",
    Experte: "Expert",
    Naturelle: "Natural",
    Contemporaine: "Contemporary",
    Premium: "Premium",
    Accessible: "Accessible",
    Artisanale: "Artisanal",
    Sophistiquée: "Sophisticated",
  },
  value: {
    Qualité: "Quality",
    Durabilité: "Durability",
    Innovation: "Innovation",
    Artisanat: "Craftsmanship",
    Transparence: "Transparency",
    Inclusivité: "Inclusivity",
    "Savoir-faire": "Expertise",
    Performance: "Performance",
    "Bien-être": "Wellbeing",
    Responsabilité: "Responsibility",
    Proximité: "Connection",
    Simplicité: "Simplicity",
  },
  category: {
    Maison: "Home",
    Beauté: "Beauty",
    Tech: "Tech",
    Mode: "Fashion",
    Sport: "Sport",
    Alimentation: "Food",
    Jardin: "Garden",
    Enfants: "Children",
  },
};
export function studioOptionLabel(
  value: string,
  kind: "personality" | "value" | "category",
) {
  return getUiLanguage() === "en" ? (labels[kind][value] ?? value) : value;
}
