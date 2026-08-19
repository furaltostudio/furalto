import type { StaticPageContent, StaticPageSection } from "@/components/shared/StaticPageLayout";
import { fetchContentByKey } from "@/lib/content/fetch";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function mergeSections(
  fallback: StaticPageSection[],
  cmsSections: unknown
): StaticPageSection[] {
  if (!Array.isArray(cmsSections) || cmsSections.length === 0) {
    return fallback;
  }

  return fallback.map((section, index) => {
    const row = (cmsSections[index] || {}) as Record<string, unknown>;
    return {
      ...section,
      title: asString(row.title, section.title),
      body: asString(row.body, section.body),
      bullets: Array.isArray(row.bullets)
        ? row.bullets.filter((item): item is string => typeof item === "string")
        : section.bullets,
    };
  });
}

/** Overlay CMS edits onto a static page while keeping layout from config. */
export async function mergeStaticPageWithCms(
  contentKey: string,
  fallback: StaticPageContent
): Promise<StaticPageContent> {
  const entry = await fetchContentByKey(contentKey);
  if (!entry?.data) {
    return fallback;
  }

  const data = entry.data as Record<string, unknown>;

  return {
    ...fallback,
    eyebrow: asString(data.eyebrow, fallback.eyebrow),
    title: asString(data.title, fallback.title),
    description: asString(data.description, fallback.description),
    heroImage: {
      ...fallback.heroImage,
      src: asString(data.heroImageSrc, fallback.heroImage.src),
      alt: asString(data.heroImageAlt, fallback.heroImage.alt),
    },
    sections: mergeSections(fallback.sections, data.sections),
  };
}
