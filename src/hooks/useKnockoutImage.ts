"use client";

import { useEffect, useState } from "react";

type KnockoutOptions = {
  /** Unused — kept for call-site compatibility. */
  tolerance?: number;
  feather?: number;
  /** Cap pixel work; keep high enough for crisp scale silhouettes. */
  maxEdge?: number;
};

export type KnockoutResult = {
  src: string;
  width: number;
  height: number;
  ready: boolean;
};

/** Display-scale cutouts look soft below ~1.2k; keep quality over raw speed. */
const DEFAULT_MAX_EDGE = 1400;

/** Load via fetch→blob so canvas is not CORS-tainted. */
async function loadImagePixels(
  src: string,
  maxEdge: number,
): Promise<{
  data: Uint8ClampedArray;
  width: number;
  height: number;
}> {
  const candidates = [src];
  if (/^https?:\/\//i.test(src)) {
    candidates.push(`/api/image-proxy?url=${encodeURIComponent(src)}`);
  }

  let lastError: unknown;
  for (const candidate of candidates) {
    let objectUrl: string | null = null;
    try {
      const res = await fetch(candidate, { mode: "cors", credentials: "omit" });
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);

      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("blob image load failed"));
        img.src = objectUrl!;
      });

      let width = image.naturalWidth || image.width;
      let height = image.naturalHeight || image.height;
      const longest = Math.max(width, height);
      if (longest > maxEdge) {
        const scale = maxEdge / longest;
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no 2d context");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, width, height);
      const frame = ctx.getImageData(0, 0, width, height);
      return { data: frame.data, width, height };
    } catch (err) {
      lastError = err;
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("image load failed");
}

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isStudioPlate(r: number, g: number, b: number, a: number) {
  if (a < 20) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const lum = luminance(r, g, b);
  // Neutral light greys / whites only — leave warm cream fabric alone.
  return chroma < 18 && lum >= 210;
}

/** Flood-fill near-white studio plate from edges so the product can be trimmed tight. */
function knockOutStudioPlate(data: Uint8ClampedArray, width: number, height: number) {
  const total = width * height;
  const seen = new Uint8Array(total);
  const queue: number[] = [];

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (seen[idx]) return;
    const i = idx * 4;
    if (!isStudioPlate(data[i], data[i + 1], data[i + 2], data[i + 3])) return;
    seen[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop()!;
    const i = idx * 4;
    data[i + 3] = 0;
    const x = idx % width;
    const y = (idx - x) / width;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
}

/**
 * Prepare scale-guide product art: remove studio plate, keep soft AA edges,
 * crop to silhouette. Avoid hard binary masks (those look jagged when scaled).
 */
async function prepareScaleCutout(
  src: string,
  maxEdge: number,
): Promise<Omit<KnockoutResult, "ready">> {
  try {
    const { data: srcData, width, height } = await loadImagePixels(src, maxEdge);
    const data = new Uint8ClampedArray(srcData);
    const total = width * height;

    let transparent = 0;
    for (let idx = 0; idx < total; idx += 1) {
      if (data[idx * 4 + 3] < 16) transparent += 1;
    }

    // Only flood-fill when the plate is still mostly opaque (AI cutout failed / partial).
    if (transparent < total * 0.12) {
      knockOutStudioPlate(data, width, height);
    }

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let opaque = 0;

    for (let idx = 0; idx < total; idx += 1) {
      const i = idx * 4;
      let a = data[i + 3];
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      const min = Math.min(data[i], data[i + 1], data[i + 2]);
      const chroma = max - min;
      const lum = luminance(data[i], data[i + 1], data[i + 2]);

      // Soft fringe only — keep mid alphas for anti-aliased edges.
      if (a > 0 && a < 28) {
        a = 0;
        data[i + 3] = 0;
      } else if (
        a >= 28 &&
        a < 220 &&
        lum > 225 &&
        chroma < 14
      ) {
        // Milky halo on edges — fade out, don't chop.
        const x = idx % width;
        const y = (idx - x) / width;
        const touchesEmpty =
          x === 0 ||
          y === 0 ||
          x === width - 1 ||
          y === height - 1 ||
          (x > 0 && data[(idx - 1) * 4 + 3] < 20) ||
          (x + 1 < width && data[(idx + 1) * 4 + 3] < 20) ||
          (y > 0 && data[(idx - width) * 4 + 3] < 20) ||
          (y + 1 < height && data[(idx + width) * 4 + 3] < 20);
        if (touchesEmpty) {
          a = 0;
          data[i + 3] = 0;
        }
      }

      if (a < 16) continue;

      opaque += 1;
      const x = idx % width;
      const y = (idx - x) / width;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    if (opaque < total * 0.02 || maxX <= minX || maxY <= minY) {
      return { src: "", width: 1, height: 1 };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { src: "", width: 1, height: 1 };
    ctx.putImageData(new ImageData(data, width, height), 0, 0);

    const pad = 4;
    const sx = Math.max(0, minX - pad);
    const sy = Math.max(0, minY - pad);
    const sw = Math.min(width - sx, maxX - minX + pad * 2);
    const sh = Math.min(height - sy, maxY - minY + pad * 2);
    const trimmed = document.createElement("canvas");
    trimmed.width = sw;
    trimmed.height = sh;
    const tctx = trimmed.getContext("2d");
    if (!tctx) return { src: "", width: 1, height: 1 };
    tctx.imageSmoothingEnabled = true;
    tctx.imageSmoothingQuality = "high";
    tctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    return { src: trimmed.toDataURL("image/png"), width: sw, height: sh };
  } catch {
    return { src: "", width: 1, height: 1 };
  }
}

/**
 * Prepare scale-guide product art: knock out plate, trim to silhouette.
 * Only exposes the trimmed result — never the raw studio plate.
 */
export function useKnockoutImage(
  src: string | null | undefined,
  options: KnockoutOptions = {},
): KnockoutResult {
  const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;
  const [result, setResult] = useState<KnockoutResult>({
    src: src || "",
    width: 1,
    height: 1,
    ready: false,
  });

  useEffect(() => {
    if (!src) {
      setResult({ src: "", width: 1, height: 1, ready: false });
      return;
    }

    let cancelled = false;
    setResult({ src: "", width: 1, height: 1, ready: false });

    prepareScaleCutout(src, maxEdge)
      .then((out) => {
        if (cancelled) return;
        if (!out.src) {
          setResult({ src: "", width: 1, height: 1, ready: false });
          return;
        }
        setResult({ ...out, ready: true });
      })
      .catch(() => {
        if (!cancelled) setResult({ src: "", width: 1, height: 1, ready: false });
      });

    return () => {
      cancelled = true;
    };
  }, [src, maxEdge]);

  return result;
}
