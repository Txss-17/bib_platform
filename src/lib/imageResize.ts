/**
 * Client-side image resize before upload.
 *
 * Keeps the boutique-media bucket light (max 1920px on the long edge by default)
 * and re-encodes JPEG/PNG/WebP at a reasonable quality. Transparency is
 * preserved (PNG -> PNG, WebP -> WebP, JPEG -> JPEG). SVG/GIF/HEIC and any
 * unknown image type are returned unchanged so animations/vectors aren't lost.
 */
export interface ResizeOptions {
  /** Max length on the longest edge in CSS pixels. Default 1920. */
  maxEdge?: number;
  /** JPEG/WebP quality (0..1). Default 0.85. */
  quality?: number;
}

const RESIZABLE = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function resizeImageFile(
  file: File,
  { maxEdge = 1920, quality = 0.85 }: ResizeOptions = {},
): Promise<File> {
  if (!RESIZABLE.has(file.type)) return file;

  const bitmap = await loadBitmap(file);
  const { width: w, height: h } = bitmap;
  const longest = Math.max(w, h);
  if (longest <= maxEdge) {
    bitmap.close?.();
    return file;
  }
  const ratio = maxEdge / longest;
  const tw = Math.round(w * ratio);
  const th = Math.round(h * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, tw, th);
  bitmap.close?.();

  const outType = file.type === "image/png" ? "image/png" : file.type;
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, outType, quality),
  );
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const ext = outType === "image/png" ? "png" : outType === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${baseName}.${ext}`, { type: outType, lastModified: Date.now() });
}

async function loadBitmap(file: File): Promise<HTMLImageElement & { close?: () => void }> {
  // Prefer createImageBitmap when available — much faster, no DOM.
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file);
      return bmp as unknown as HTMLImageElement & { close?: () => void };
    } catch {
      /* fall through to <img> path */
    }
  }
  return await new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img as HTMLImageElement & { close?: () => void });
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}