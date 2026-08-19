/**
 * Browser-side studio plate cleanup.
 * Washes EDGE-CONNECTED grey/cool studio plates onto a solid stage color.
 * Never recolors near-white pixels (protects white upholstery).
 */
export const GALLERY_STAGE_RGB = { r: 254, g: 247, b: 239 } as const;
export const WHITE_STAGE_RGB = { r: 255, g: 255, b: 255 } as const;

type RGB = { r: number; g: number; b: number };

function colorDistance(a: RGB, b: RGB) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function luminance({ r, g, b }: RGB) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function saturation({ r, g, b }: RGB) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function sampleRegion(
  data: Uint8ClampedArray,
  width: number,
  sx: number,
  sy: number,
  size: number,
  height: number,
) {
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

  if (count === 0) return { r: 220, g: 220, b: 220 };
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
) {
  const size = Math.max(6, Math.floor(Math.min(width, height) * 0.05));
  // Deep inset so white letterbox pads don't hide the real studio plate.
  const inset = Math.max(4, Math.floor(Math.min(width, height) * 0.14));
  const points = [
    [inset, inset],
    [width - size - inset, inset],
    [inset, height - size - inset],
    [width - size - inset, height - size - inset],
    [Math.floor(width / 2 - size / 2), inset],
    [Math.floor(width / 2 - size / 2), height - size - inset],
    [inset, Math.floor(height / 2 - size / 2)],
    [width - size - inset, Math.floor(height / 2 - size / 2)],
  ] as const;

  const samples = points.map(([x, y]) =>
    sampleRegion(data, width, x, y, size, height),
  );

  samples.sort((a, b) => {
    const score = (c: RGB) => {
      const lum = luminance(c);
      const sat = saturation(c);
      return sat * 3 + Math.abs(lum - 0.78);
    };
    return score(a) - score(b);
  });

  return samples[0];
}

/** Flat mid-grey / cool studio ground — never near-white fabric. */
function isGreyPlatePixel(pixel: RGB, ground: RGB) {
  const lum = luminance(pixel);
  const sat = saturation(pixel);

  if (lum > 0.87) return false;
  if (lum < 0.55) return false;
  if (sat > 0.14) return false;

  return colorDistance(pixel, ground) < 44;
}

/**
 * Returns a blob: URL with edge-connected grey backdrop replaced,
 * or null when unsafe / unnecessary.
 */
export async function neutralizeGalleryBackdrop(
  src: string,
  target: RGB = GALLERY_STAGE_RGB,
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
  const { data } = frame;
  const ground = sampleStudioGround(data, width, height);
  const groundLum = luminance(ground);
  const groundSat = saturation(ground);

  // Skip lifestyle rooms and already-white studios.
  if (groundLum < 0.55 || groundLum > 0.88 || groundSat > 0.2) {
    return null;
  }

  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const enqueueBorder = (x: number, y: number) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    const pixel = { r: data[i], g: data[i + 1], b: data[i + 2] };
    if (!isGreyPlatePixel(pixel, ground)) return;
    visited[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x = 0; x < width; x += 1) {
    enqueueBorder(x, 0);
    enqueueBorder(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueueBorder(0, y);
    enqueueBorder(width - 1, y);
  }

  // If borders are white pad, seed from inset edge mids (into the plate).
  if (tail === 0) {
    const inset = Math.floor(Math.min(width, height) * 0.12);
    const seeds = [
      [inset, inset],
      [width - 1 - inset, inset],
      [inset, height - 1 - inset],
      [width - 1 - inset, height - 1 - inset],
      [Math.floor(width / 2), inset],
      [Math.floor(width / 2), height - 1 - inset],
    ] as const;
    for (const [x, y] of seeds) enqueueBorder(x, y);
  }

  if (tail === 0) {
    return null;
  }

  let replaced = 0;
  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const;

  while (head < tail) {
    const idx = queue[head++];
    const i = idx * 4;
    data[i] = target.r;
    data[i + 1] = target.g;
    data[i + 2] = target.b;
    replaced += 1;

    const x = idx % width;
    const y = (idx - x) / width;

    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;
      const ni = nIdx * 4;
      const pixel = { r: data[ni], g: data[ni + 1], b: data[ni + 2] };
      if (!isGreyPlatePixel(pixel, ground)) continue;
      visited[nIdx] = 1;
      queue[tail++] = nIdx;
    }
  }

  if (replaced < total * 0.06) {
    return null;
  }

  ctx.putImageData(frame, 0, 0);

  const out = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), "image/jpeg", 0.94);
  });
  if (!out) return null;

  return URL.createObjectURL(out);
}
