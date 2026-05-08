/** Curated list of Google Fonts for the boutique editor. */
export const GOOGLE_FONTS = {
  display: [
    "Playfair Display", "Cormorant Garamond", "DM Serif Display", "Bodoni Moda",
    "Libre Caslon Display", "Marcellus", "Italiana", "Cinzel", "Fraunces",
    "Abril Fatface", "Yeseva One", "Tenor Sans", "Forum", "Spectral",
    "Lora", "EB Garamond", "Crimson Pro", "Cardo", "Old Standard TT",
    "Archivo Black", "Anton", "Bebas Neue", "Oswald", "Raleway",
    "Montserrat", "Poppins", "Outfit", "Sora", "Space Grotesk",
    "Syne", "Unbounded", "Big Shoulders Display", "Righteous", "Caveat",
    "Pacifico", "Dancing Script", "Great Vibes", "Sacramento", "Allura",
    "Permanent Marker", "Shrikhand", "Lobster", "Satisfy", "Playfair",
  ],
  body: [
    "Inter", "Manrope", "DM Sans", "Work Sans", "Nunito Sans", "Open Sans",
    "Roboto", "Lato", "Source Sans 3", "Karla", "PT Sans", "Mulish",
    "Quicksand", "Rubik", "Hind", "Public Sans", "IBM Plex Sans",
    "Plus Jakarta Sans", "Be Vietnam Pro", "Figtree", "Geist",
    "Lora", "Merriweather", "EB Garamond", "Crimson Pro", "Source Serif 4",
    "Noto Sans", "Noto Serif",
  ],
} as const;

const loaded = new Set<string>();
export function loadGoogleFont(family: string | undefined | null) {
  if (!family || typeof document === "undefined") return;
  const key = family.trim();
  if (!key || loaded.has(key)) return;
  loaded.add(key);
  const id = `gf-${key.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(key)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export const ALL_FONTS = Array.from(new Set([...GOOGLE_FONTS.display, ...GOOGLE_FONTS.body])).sort();
