import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ZoomIn, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * OG image cropper dialog: drag to reposition, slider to zoom, exports a
 * 1200×630 JPEG ready to upload. Source dimensions/ratio are validated up-front
 * so users see useful warnings before they commit.
 */

const TARGET_W = 1200;
const TARGET_H = 630;
const TARGET_RATIO = TARGET_W / TARGET_H;

type Props = {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
};

export function OgImageCropperDialog({ open, file, onClose, onConfirm }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  // Display canvas size (preview); export uses TARGET_W × TARGET_H.
  const PREVIEW_W = 480;
  const PREVIEW_H = Math.round(PREVIEW_W / TARGET_RATIO);

  // Load file -> image
  useEffect(() => {
    if (!file) { setSrc(null); setImg(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    const i = new Image();
    i.onload = () => {
      setImg(i);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    i.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Validation of source file (dimensions + ratio offset)
  const validation = (() => {
    if (!img) return null;
    const ratio = img.naturalWidth / img.naturalHeight;
    const ratioDiff = Math.abs(ratio - TARGET_RATIO) / TARGET_RATIO;
    const tooSmall =
      img.naturalWidth < TARGET_W || img.naturalHeight < TARGET_H;
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      ratio,
      ratioDiff,
      tooSmall,
      offRatio: ratioDiff > 0.15, // > 15% off the 1.91:1 target
    };
  })();

  // Compute base scale so the image "covers" the preview at zoom=1
  const baseScale = useCallback(() => {
    if (!img) return 1;
    return Math.max(PREVIEW_W / img.naturalWidth, PREVIEW_H / img.naturalHeight);
  }, [img]);

  // Draw on each change
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !img) return;
    c.width = PREVIEW_W;
    c.height = PREVIEW_H;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H);
    const s = baseScale() * zoom;
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    const dx = (PREVIEW_W - dw) / 2 + offset.x;
    const dy = (PREVIEW_H - dh) / 2 + offset.y;
    ctx.drawImage(img, dx, dy, dw, dh);
    // Safe-area guides
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, PREVIEW_W - 1, PREVIEW_H - 1);
  }, [img, zoom, offset, baseScale]);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };
  const onPointerUp = () => { setDragging(false); dragStart.current = null; };

  const handleConfirm = async () => {
    if (!img) return;
    setBusy(true);
    try {
      const out = document.createElement("canvas");
      out.width = TARGET_W;
      out.height = TARGET_H;
      const ctx = out.getContext("2d")!;
      // Reproduce preview transform at full resolution
      const s = baseScale() * zoom;
      const scaleToTarget = TARGET_W / PREVIEW_W;
      const dw = img.naturalWidth * s * scaleToTarget;
      const dh = img.naturalHeight * s * scaleToTarget;
      const dx = (TARGET_W - dw) / 2 + offset.x * scaleToTarget;
      const dy = (TARGET_H - dh) / 2 + offset.y * scaleToTarget;
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, TARGET_W, TARGET_H);
      ctx.drawImage(img, dx, dy, dw, dh);
      const blob: Blob = await new Promise((resolve, reject) =>
        out.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Export échoué"))),
          "image/jpeg",
          0.9
        )
      );
      await onConfirm(blob);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Recadrer l'image OG</DialogTitle>
          <DialogDescription>
            Glissez pour repositionner, ajustez le zoom puis enregistrez. La sortie
            sera exportée en {TARGET_W}×{TARGET_H} (ratio 1.91:1).
          </DialogDescription>
        </DialogHeader>

        {validation && (
          <Alert
            className={
              validation.tooSmall || validation.offRatio
                ? "border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20"
                : "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
            }
          >
            {validation.tooSmall || validation.offRatio ? (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            <AlertDescription className="text-xs space-y-0.5">
              <p>
                Source : {validation.width}×{validation.height}px (ratio{" "}
                {validation.ratio.toFixed(2)}, cible 1.91)
              </p>
              {validation.tooSmall && (
                <p>
                  Image plus petite que {TARGET_W}×{TARGET_H} — qualité dégradée
                  après recadrage.
                </p>
              )}
              {validation.offRatio && (
                <p>
                  Ratio décalé de {(validation.ratioDiff * 100).toFixed(0)}% par
                  rapport à 1.91:1 — des bandes peuvent être rognées.
                </p>
              )}
              {!validation.tooSmall && !validation.offRatio && (
                <p>Image conforme à la cible Open Graph.</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="rounded-md border border-border touch-none cursor-grab active:cursor-grabbing"
            style={{ width: PREVIEW_W, height: PREVIEW_H, maxWidth: "100%" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ZoomIn className="w-3.5 h-3.5" /> Zoom {(zoom * 100).toFixed(0)}%
          </div>
          <Slider
            value={[zoom * 100]}
            min={100}
            max={300}
            step={1}
            onValueChange={(v) => setZoom(v[0] / 100)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!img || busy}>
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Recadrer & enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}