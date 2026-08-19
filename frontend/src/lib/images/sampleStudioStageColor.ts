/**
 * Sample studio plate color from product photography (corners / edge mids).
 * Used to tint the card mat so baked-in grey plates don't show as a "box in a box".
 * Never mutates pixels — safe for white / light upholstery.
 */

export const WHITE_STAGE_CSS = "#ffffff";

type RGB = { r: number; g: number; b: number };

function luminance({ r, g, b }: RGB) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function saturation({ r, g, b }: RGB) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function toCss({ r, g, b }: RGB) {
  return `rgb(${r}, ${g}, ${b})`;
}

function sampleRegion(
  data: Uint8ClampedArray,
  width: number,
  sx: number,
  sy: number,
  size: number,
  height: number,
): RGB {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  const x0 = Math.max(0, Math.floor(sx));
  const y0 = Math.max(0, Math.floor(sy));
  const x1 = Math.min(width, x0 + size);
  const y1 = Math.min(height, y0 + size);

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (y * width + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count += 1;
    }
  }

  if (count === 0) return { r: 255, g: 255, b: 255 };
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}

function sampleStudioGround(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): RGB {
  const size = Math.max(6, Math.floor(Math.min(width, height) * 0.04));
  // Prefer true corners (baked plate), not deep inset into the product.
  const inset = Math.max(2, Math.floor(Math.min(width, height) * 0.02));
  const points = [
    [inset, inset],
    [width - size - inset, inset],
    [inset, height - size - inset],
    [width - size - inset, height - size - inset],
    [Math.floor(width / 2 - size / 2), inset],
    [Math.floor(width / 2 - size / 2), height - size - inset],
  ] as const;

  const samples = points.map(([x, y]) =>
    sampleRegion(data, width, x, y, size, height),
  );

  // Prefer low-saturation, light grounds (studio plates over furniture).
  samples.sort((a, b) => {
    const score = (c: RGB) => saturation(c) * 4 + Math.abs(luminance(c) - 0.82);
    return score(a) - score(b);
  });

  return samples[0];
}

/**
 * Returns a CSS color for the card media mat, or null if sampling fails.
 * Near-white studios snap to pure white so cards stay consistent.
 */
export async function sampleStudioStageColor(
  src: string,
): Promise<string | null> {
  if (typeof window === "undefined") return null;

  let bitmap: ImageBitmap | null = null;
  try {
    const response = await fetch(src, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    bitmap = await createImageBitmap(blob);
  } catch {
    return null;
  }

  if (!bitmap || bitmap.width < 8 || bitmap.height < 8) {
    bitmap?.close();
    return null;
  }

  const width = bitmap.width;
  const height = bitmap.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    return null;
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const frame = ctx.getImageData(0, 0, width, height);
  const ground = sampleStudioGround(frame.data, width, height);
  const lum = luminance(ground);
  const sat = saturation(ground);

  // Lifestyle / dark / vivid — keep default white mat.
  if (lum < 0.62 || sat > 0.22) {
    return WHITE_STAGE_CSS;
  }

  // Already white / off-white studio — snap to pure white.
  if (lum > 0.9) {
    return WHITE_STAGE_CSS;
  }

  return toCss(ground);
}
