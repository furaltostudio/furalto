import type { Product, ProductImage } from "@/types/product";

const sceneScoreCache = new Map<string, number>();
const pickCache = new Map<
  string,
  { primary: ProductImage; secondary: ProductImage | null }
>();

export function isSpecSheetImage(img: ProductImage) {
  const text = `${img.alt} ${img.src}`;
  // Catalog dimension boards are usually 5_*.png or 8_*.png (not lifestyle WebPs).
  if (/\/(?:5|8)[_-][^/?#]+\.png(?:\?|$)/i.test(img.src)) return true;
  return /spec|dimension|measure|sheet|diagram|blueprint|infographic/i.test(text);
}

/** Catalog primary — filename 4_/4v_ (sofa/bed hero) or first gallery slot. */
export function isCatalogPrimaryImage(img: ProductImage) {
  return /\/4v?_[^/?#]+\.(jpe?g|webp|png)/i.test(img.src);
}

function isLikelyCutout(img: ProductImage) {
  return (
    /\.png(\?|$)/i.test(img.src) &&
    !isCatalogPrimaryImage(img)
  );
}

/** Sync ranking — image 4 / DB primary always wins for listing. */
export function syncListingScore(
  img: ProductImage,
  index: number,
  total: number,
): number {
  if (isSpecSheetImage(img)) return -1000;

  let score = 0;

  // Sofas/beds: image 4 is the chosen storefront hero.
  if (isCatalogPrimaryImage(img)) score += 200;

  // After DB promote, primary sits at index 0 — keep it there.
  if (index === 0) score += 80;

  if (isLikelyCutout(img)) score -= 40;
  if (/\.(jpe?g|webp)(\?|$)/i.test(img.src)) score += 8;

  score += Math.max(0, 3 - index);
  void total;
  return score;
}

function usableImages(product: Product) {
  return (product.images ?? []).filter(
    (img) => img?.src && !isSpecSheetImage(img),
  );
}

export function pickListingImagesSync(product: Product): {
  primary: ProductImage | null;
  secondary: ProductImage | null;
} {
  const usable = usableImages(product);
  if (usable.length === 0) {
    return { primary: product.images?.[0] ?? null, secondary: null };
  }

  // Trust DB order — images[0] is the curated storefront primary.
  const primary = usable[0];
  const secondary =
    usable.find((img) => img.src !== primary?.src) ?? null;

  return { primary, secondary };
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

  if (count === 0) return { r: 255, g: 255, b: 255, lum: 1 };
  const rr = r / count;
  const gg = g / count;
  const bb = b / count;
  return {
    r: rr,
    g: gg,
    b: bb,
    lum: (0.2126 * rr + 0.7152 * gg + 0.0722 * bb) / 255,
  };
}

export async function scoreSceneRichness(src: string): Promise<number> {
  const cached = sceneScoreCache.get(src);
  if (cached != null) return cached;
  if (typeof window === "undefined") return 0;

  let bitmap: ImageBitmap | null = null;
  try {
    const probe = src.includes("res.cloudinary.com")
      ? src.replace(/\/upload\//, "/upload/c_limit,w_280,h_210,q_40,f_auto/")
      : src;
    const response = await fetch(probe, { mode: "cors" });
    if (!response.ok) {
      sceneScoreCache.set(src, 0);
      return 0;
    }
    bitmap = await createImageBitmap(await response.blob());
  } catch {
    sceneScoreCache.set(src, 0);
    return 0;
  }

  if (!bitmap || bitmap.width < 8 || bitmap.height < 8) {
    bitmap?.close();
    sceneScoreCache.set(src, 0);
    return 0;
  }

  const width = bitmap.width;
  const height = bitmap.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    sceneScoreCache.set(src, 0);
    return 0;
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, width, height);
  const size = Math.max(4, Math.floor(Math.min(width, height) * 0.06));
  const inset = Math.max(2, Math.floor(Math.min(width, height) * 0.04));
  const points = [
    [inset, inset],
    [width - size - inset, inset],
    [inset, height - size - inset],
    [width - size - inset, height - size - inset],
  ] as const;

  const samples = points.map(([x, y]) =>
    sampleRegion(data, width, x, y, size, height),
  );
  const lums = samples.map((s) => s.lum);
  const mean = lums.reduce((a, b) => a + b, 0) / lums.length;
  const variance =
    lums.reduce((sum, lum) => sum + (lum - mean) ** 2, 0) / lums.length;

  let score = variance * 400;
  if (mean > 0.9 && variance < 0.003) score -= 20;
  sceneScoreCache.set(src, score);
  return score;
}

function cacheKey(product: Product) {
  return `${product.slug}:${(product.images ?? []).map((img) => img.src).join("|")}`;
}

/**
 * Listing frame = catalog primary (image 4 / first gallery slot).
 */
export async function pickListingImages(product: Product): Promise<{
  primary: ProductImage | null;
  secondary: ProductImage | null;
}> {
  const key = cacheKey(product);
  const cached = pickCache.get(key);
  if (cached) return cached;

  const sync = pickListingImagesSync(product);
  if (!sync.primary) return sync;

  pickCache.set(key, { primary: sync.primary, secondary: sync.secondary });
  return sync;
}
