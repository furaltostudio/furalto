import type { MetadataRoute } from "next";
import { inspirationRooms } from "@/config/collections";
import { mainNavigation } from "@/config/navigation";
import {
  allCareRooms,
  allGuideTopics,
  allSwatchRooms,
  getAllStaticPageSlugs,
} from "@/config/static-pages";
import { siteConfig } from "@/config/site";
import { staticJournalPosts } from "@/lib/content/journal";
import { fetchProductSlugs } from "@/lib/products/catalog";

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(
  route: string,
  options: Pick<SitemapEntry, "changeFrequency" | "priority"> = {}
): SitemapEntry {
  return {
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: options.changeFrequency ?? "weekly",
    priority: options.priority ?? 0.7,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = getAllStaticPageSlugs().map((page) => `/${page}`);
  const collectionRoutes = mainNavigation.map((item) => item.href);
  const inspirationRoutes = Object.keys(inspirationRooms).map(
    (room) => `/inspiration/${room}`
  );
  const productRoutes = (await fetchProductSlugs()).map((slug) => `/products/${slug}`);
  const careRoutes = allCareRooms.map((room) => `/care/${room}`);
  const guideRoutes = allGuideTopics.map((topic) => `/guides/${topic}`);
  const swatchRoutes = allSwatchRooms.map((room) => `/swatches/${room}`);

  return [
    entry("", { changeFrequency: "daily", priority: 1 }),
    entry("/collections", { priority: 0.95 }),
    entry("/inspiration", { priority: 0.85 }),
    entry("/showrooms", { priority: 0.9 }),
    entry("/contact", { priority: 0.85 }),
    entry("/appointments", { priority: 0.8 }),
    entry("/custom", { priority: 0.9 }),
    entry("/testimonials", { priority: 0.75 }),
    entry("/design/consultation", { priority: 0.75 }),
    entry("/care", { priority: 0.65 }),
    entry("/swatches", { priority: 0.65 }),
    entry("/search", { changeFrequency: "daily", priority: 0.5 }),
    entry("/blog", { changeFrequency: "weekly", priority: 0.8 }),
    ...staticJournalPosts.map((post) =>
      entry(`/blog/${post.slug}`, { changeFrequency: "monthly", priority: 0.7 })
    ),
    ...collectionRoutes.map((route) => entry(route, { priority: 0.9 })),
    ...inspirationRoutes.map((route) => entry(route, { priority: 0.7 })),
    ...staticRoutes.map((route) =>
      entry(route, {
        priority: route === "/about" ? 0.85 : 0.6,
        changeFrequency: "monthly",
      })
    ),
    ...productRoutes.map((route) =>
      entry(route, { changeFrequency: "weekly", priority: 0.8 })
    ),
    ...careRoutes.map((route) => entry(route, { priority: 0.55 })),
    ...guideRoutes.map((route) => entry(route, { priority: 0.55 })),
    ...swatchRoutes.map((route) => entry(route, { priority: 0.55 })),
  ];
}
