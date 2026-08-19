"use client";

import { useEffect, useState } from "react";

type KnockoutOptions = {
  /** Unused — kept for call-site compatibility. */
  tolerance?: number;
  feather?: number;
};

export type KnockoutResult = {
  src: string;
  width: number;
  height: number;
  ready: boolean;
};

/** Load via fetch→blob so canvas is not CORS-tainted. */
async function loadImagePixels(src: string): Promise<{
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

      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no 2d context");
      ctx.drawImage(image, 0, 0);
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
  // White / light-grey studio plates only — keep cream fabric.
  return chroma < 18 && lum >= 242;
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
 * Prepare scale-guide product art: knock out studio plate if needed, scrub fringe,
 * then crop to the opaque silhouette so object-fit fills the true W×H box.
 */
async function prepareScaleCutout(
  src: string
): Promise<Omit<KnockoutResult, "ready">> {
  try {
    const { data: srcData, width, height } = await loadImagePixels(src);
    const data = new Uint8ClampedArray(srcData);
    const total = width * height;

    let transparent = 0;
    for (let idx = 0; idx < total; idx += 1) {
      if (data[idx * 4 + 3] < 16) transparent += 1;
    }

    // No useful alpha yet — flood-fill the studio plate from the edges.
    if (transparent < total * 0.08) {
      knockOutStudioPlate(data, width, height);
    }

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let opaque = 0;
    transparent = 0;

    for (let idx = 0; idx < total; idx += 1) {
      const i = idx * 4;
      const a = data[i + 3];
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      const min = Math.min(data[i], data[i + 1], data[i + 2]);
      const chroma = max - min;
      const lum = luminance(data[i], data[i + 1], data[i + 2]);

      // Kill soft AI fringe + milky near-white edge glow.
      if (a > 0 && a < 200) {
        data[i + 3] = 0;
      } else if (a >= 200 && lum > 235 && chroma < 16) {
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
        if (touchesEmpty) data[i + 3] = 0;
      }

      if (data[i + 3] < 16) {
        transparent += 1;
        continue;
      }

      data[i + 3] = 255;
      opaque += 1;
      const x = idx % width;
      const y = (idx - x) / width;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    if (opaque < total * 0.02 || maxX <= minX || maxY <= minY) {
      return { src, width, height };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { src, width, height };
    ctx.putImageData(new ImageData(data, width, height), 0, 0);

    const pad = 2;
    const sx = Math.max(0, minX - pad);
    const sy = Math.max(0, minY - pad);
    const sw = Math.min(width - sx, maxX - minX + pad * 2);
    const sh = Math.min(height - sy, maxY - minY + pad * 2);
    const trimmed = document.createElement("canvas");
    trimmed.width = sw;
    trimmed.height = sh;
    const tctx = trimmed.getContext("2d");
    if (!tctx) return { src, width, height };
    tctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    return { src: trimmed.toDataURL("image/png"), width: sw, height: sh };
  } catch {
    return { src, width: 1, height: 1 };
  }
}

/**
 * Prepare scale-guide product art: knock out plate, trim to silhouette.
 */
export function useKnockoutImage(
  src: string | null | undefined,
  _options: KnockoutOptions = {}
): KnockoutResult {
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
    setResult((prev) => ({ ...prev, src, ready: false }));

    prepareScaleCutout(src)
      .then((out) => {
        if (!cancelled) setResult({ ...out, ready: true });
      })
      .catch(() => {
        if (!cancelled) setResult({ src, width: 1, height: 1, ready: true });
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return result;
}
