const CLOUDINARY_UPLOAD = "/upload/";

type CatalogImageOptions = {
  width?: number;
  height?: number;
};

/**
 * Normalize Cloudinary product shots for catalog/PDP tiles.
 * Fit the full photo into a white mat — avoid e_trim (eats light upholstery / lifestyle).
 */
export function catalogImageSrc(
  src: string,
  { width = 1600, height = 1200 }: CatalogImageOptions = {},
): string {
  if (!src.includes("res.cloudinary.com") || !src.includes(CLOUDINARY_UPLOAD)) {
    return src;
  }

  const transform = `c_fit,w_${width},h_${height}/c_pad,b_rgb:FFFFFF,w_${width},h_${height},q_auto:good,f_auto`;
  return src.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}${transform}/`);
}

/** Tall atelier frame — full piece visible, no aggressive trim. */
export function editorialImageSrc(
  src: string,
  { width = 900, height = 1200 }: CatalogImageOptions = {},
): string {
  if (!src.includes("res.cloudinary.com") || !src.includes(CLOUDINARY_UPLOAD)) {
    return src;
  }

  const transform = `c_fit,w_${width},h_${height}/c_pad,b_rgb:FFFFFF,w_${width},h_${height},q_auto:good,f_auto`;
  return src.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}${transform}/`);
}

/**
 * Collection listing frames — gentle white pad into a wide 3:2 stage.
 * Avoid aggressive trim: light sofas on grey/white studios get eaten by e_trim.
 */
export function galleryImageSrc(
  src: string,
  { width = 1600, height = 1067 }: CatalogImageOptions = {},
): string {
  if (!src.includes("res.cloudinary.com") || !src.includes(CLOUDINARY_UPLOAD)) {
    return src;
  }

  const transform = `c_pad,b_rgb:FFFFFF,w_${width},h_${height},q_auto:good,f_auto`;
  return src.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}${transform}/`);
}

/**
 * Scale-guide source — Cloudinary AI cutout when available, then fit.
 * Client only trims transparent padding afterwards.
 */
export function scaleCompareImageSrc(
  src: string,
  { width = 1600, height = 1200 }: CatalogImageOptions = {},
): string {
  if (!src.includes("res.cloudinary.com") || !src.includes(CLOUDINARY_UPLOAD)) {
    return src;
  }

  // e_background_removal needs a clean public id (no prior transforms in path).
  const transform = `e_background_removal/c_fit,w_${width},h_${height},f_png`;
  return src.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}${transform}/`);
}

/** Shared atelier ground — matches white studio mats on collection tiles. */
export const GALLERY_STAGE_HEX = "FFFFFF";

/**
 * Collection gallery — fit the full photo into a white mat (never crop the piece).
 */
export function mosaicImageSrc(
  src: string,
  { width = 1800, height = 1350 }: CatalogImageOptions = {},
): string {
  if (!src.includes("res.cloudinary.com") || !src.includes(CLOUDINARY_UPLOAD)) {
    return src;
  }

  // c_fit scales the whole image into the box; c_pad fills the remaining mat.
  const transform = `c_fit,w_${width},h_${height}/c_pad,b_rgb:${GALLERY_STAGE_HEX},w_${width},h_${height},q_auto:good,f_auto`;
  return src.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}${transform}/`);
}

/**
 * Carousel / related cards — size only, no pad.
 * Grey studio plates stay at the edges so client cleanup can detect them,
 * then flatten onto the white card stage.
 */
export function carouselImageSrc(
  src: string,
  { width = 1600, height = 1067 }: CatalogImageOptions = {},
): string {
  if (!src.includes("res.cloudinary.com") || !src.includes(CLOUDINARY_UPLOAD)) {
    return src;
  }

  const transform = `c_limit,w_${width},h_${height},q_auto:good,f_auto`;
  return src.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}${transform}/`);
}
