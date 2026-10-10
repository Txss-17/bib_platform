const RESIZABLE = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp"]);
async function resizeImageFile(file, { maxEdge = 1920, quality = 0.85 } = {}) {
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
  const blob = await new Promise(
    (resolve) => canvas.toBlob(resolve, outType, quality)
  );
  if (!blob) return file;
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const ext = outType === "image/png" ? "png" : outType === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${baseName}.${ext}`, { type: outType, lastModified: Date.now() });
}
async function loadBitmap(file) {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file);
      return bmp;
    } catch {
    }
  }
  return await new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
export {
  resizeImageFile
};
