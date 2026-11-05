export type SupportedEmbed = { url: string; provider: "YouTube" | "Vimeo" | "Google Maps" };

/** Only disclosed providers may be embedded. Merchant URLs cannot add new trackers. */
export function supportedExternalEmbed(source: string): SupportedEmbed | null {
  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    if (["youtube.com", "www.youtube.com", "youtu.be", "www.youtube-nocookie.com", "youtube-nocookie.com"].includes(host)) {
      const id = host === "youtu.be" ? url.pathname.slice(1) : url.pathname.startsWith("/embed/") ? url.pathname.slice(7) : url.searchParams.get("v");
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? { url: `https://www.youtube-nocookie.com/embed/${id}`, provider: "YouTube" } : null;
    }
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const match = url.pathname.match(/^\/(?:video\/)?(\d+)\/?$/);
      return match ? { url: `https://player.vimeo.com/video/${match[1]}?dnt=1`, provider: "Vimeo" } : null;
    }
    if (["www.google.com", "www.google.fr", "maps.google.com"].includes(host) &&
      (url.pathname.startsWith("/maps/embed") || (url.pathname === "/maps" && url.searchParams.get("output") === "embed"))) {
      return { url: url.href, provider: "Google Maps" };
    }
    return null;
  } catch { return null; }
}
