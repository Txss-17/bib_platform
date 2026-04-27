import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
}

export function useSEO({ title, description, image, url, type = "website" }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = `${title} | Brand-In-A-Box`;

    // Helper to set or create meta tags
    const setMeta = (property: string, content: string, isOG = false) => {
      const attr = isOG ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Standard meta
    if (description) setMeta("description", description);

    // Open Graph
    setMeta("og:title", title, true);
    if (description) setMeta("og:description", description, true);
    if (image) setMeta("og:image", image, true);
    setMeta("og:type", type === "product" ? "product" : "website", true);
    setMeta("og:url", url || window.location.href, true);
    setMeta("og:site_name", "Brand-In-A-Box", true);

    // Twitter Card
    setMeta("twitter:card", image ? "summary_large_image" : "summary");
    setMeta("twitter:title", title);
    if (description) setMeta("twitter:description", description);
    if (image) setMeta("twitter:image", image);

    return () => {
      document.title = "Brand-In-A-Box";
    };
  }, [title, description, image, url, type]);
}
