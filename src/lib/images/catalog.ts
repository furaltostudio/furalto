const CLOUDINARY_UPLOAD = "/upload/";

type CatalogImageOptions = {
  width?: number;
  height?: number;
};

/**
 * Rebuild a Cloudinary delivery URL with a fresh transform chain.
 * Strips prior transforms so AI ops like e_background_removal see the raw asset.
 */
function withCloudinaryTransform(src: string, transform: string): string {
  if (!src.includes("res.cloudinary.com") || !src.includes(CLOUDINARY_UPLOAD)) {
    return src;
  }

  const marker = CLOUDINARY_UPLOAD;
  const at = src.indexOf(marker);
  if (at < 0) return src;

  const prefix = src.slice(0, at + marker.length);
  const rest = src.slice(at + marker.length);
  // .../upload/v123/folder/file.jpg  OR  .../upload/c_fit,.../v123/folder/file.jpg
  const versionAtStart = rest.match(/^(v\d+\/.+)$/);
  if (versionAtStart) {
    return `${prefix}${transform}/${versionAtStart[1]}`;
  }
  const versionInPath = rest.match(/\/(v\d+\/.+)$/);
  if (versionInPath) {
    return `${prefix}${transform}/${versionInPath[1]}`;
  }

  // No version segment — drop leading transform tokens (contain _, =, or commas).
  const parts = rest.split("/");
  let start = 0;
  while (
    start < parts.length - 1 &&
    /[,_=]|^[a-z]{1,4}_/i.test(parts[start] || "")
  ) {
    start += 1;
  }
  const publicId = parts.slice(start).join("/");
  return `${prefix}${transform}/${publicId}`;
}

/** Soft white mat + fit (never crop the piece). */
function whiteMatFit(width: number, height: number) {
  return `c_fit,w_${width},h_${height}/c_pad,b_rgb:FFFFFF,w_${width},h_${height}`;
}

/**
 * Same family as About team photos (minus e_upscale — fails on large studio shots):
 * best encode + strong sharpen for fabric / edge clarity.
 */
function detailQuality(width: number, height: number) {
  return `${whiteMatFit(width, height)},q_auto:best,e_sharpen:60,f_auto`;
}

/**
 * Listing / card quality — still sharp, slightly lighter than PDP.
 */
function listingQuality(width: number, height: number, fit: "pad" | "limit" | "mat") {
  if (fit === "limit") {
    return `c_limit,w_${width},h_${height},q_auto:best,e_sharpen:50,f_auto`;
  }
  if (fit === "pad") {
    return `c_pad,b_rgb:FFFFFF,w_${width},h_${height},q_auto:best,e_sharpen:50,f_auto`;
  }
  return `${whiteMatFit(width, height)},q_auto:best,e_sharpen:55,f_auto`;
}

/**
 * Normalize Cloudinary product shots for catalog/PDP tiles.
 * Fit the full photo into a white mat — avoid e_trim (eats light upholstery / lifestyle).
 */
export function catalogImageSrc(
  src: string,
  { width = 2000, height = 1500 }: CatalogImageOptions = {},
): string {
  return withCloudinaryTransform(src, detailQuality(width, height));
}

/**
 * Tall atelier frame — full piece visible, no aggressive trim.
 */
export function editorialImageSrc(
  src: string,
  { width = 900, height = 1200 }: CatalogImageOptions = {},
): string {
  return withCloudinaryTransform(src, detailQuality(width, height));
}

/**
 * Collection listing frames — gentle white pad into a wide 3:2 stage.
 * Avoid aggressive trim: light sofas on grey/white studios get eaten by e_trim.
 */
export function galleryImageSrc(
  src: string,
  { width = 1800, height = 1200 }: CatalogImageOptions = {},
): string {
  return withCloudinaryTransform(src, listingQuality(width, height, "pad"));
}

/**
 * Scale-guide cutout — modest size for AI + client trim speed.
 */
export function scaleCompareImageSrc(
  src: string,
  { width = 1400, height = 1100 }: CatalogImageOptions = {},
): string {
  const transform = `e_background_removal/c_fit,w_${width},h_${height},f_png,q_auto:best`;
  return withCloudinaryTransform(src, transform);
}

/**
 * PDP gallery cutout for non-primary studio shots (transparent PNG).
 * Keep hero/lifestyle (index 0) on catalogImageSrc instead.
 */
export function galleryCutoutImageSrc(
  src: string,
  { width = 1600, height = 1200 }: CatalogImageOptions = {},
): string {
  const transform = `e_background_removal/c_fit,w_${width},h_${height},f_png,q_auto:best,e_sharpen:50`;
  return withCloudinaryTransform(src, transform);
}

/**
 * Navbar mega-menu tiles — small but sharp (cards ~16rem / retina).
 */
export function megaMenuImageSrc(
  src: string,
  { width = 800, height = 600 }: CatalogImageOptions = {},
): string {
  return withCloudinaryTransform(
    src,
    `c_limit,w_${width},h_${height},q_auto:best,e_sharpen:45,f_auto`,
  );
}

/** Shared atelier ground — matches white studio mats on collection tiles. */
export const GALLERY_STAGE_HEX = "FFFFFF";

/**
 * Collection gallery — fit the full photo into a white mat (never crop the piece).
 */
export function mosaicImageSrc(
  src: string,
  { width = 2000, height = 1500 }: CatalogImageOptions = {},
): string {
  return withCloudinaryTransform(src, listingQuality(width, height, "mat"));
}

/**
 * Carousel / related cards — size only, no pad.
 * Grey studio plates stay at the edges so client cleanup can detect them,
 * then flatten onto the white card stage.
 */
export function carouselImageSrc(
  src: string,
  { width = 1800, height = 1200 }: CatalogImageOptions = {},
): string {
  return withCloudinaryTransform(src, listingQuality(width, height, "limit"));
}
