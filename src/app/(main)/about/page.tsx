import { AboutPageContent } from "@/components/about/AboutPageContent";
import { getStaticPage } from "@/config/static-pages";
import { mergeStaticPageWithCms } from "@/lib/content/mergeStaticPage";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const content = getStaticPage("about");
  if (!content) {
    return createMetadata({ title: "About", path: "/about" });
  }
  const merged = await mergeStaticPageWithCms("page.about", content);
  return createMetadata({
    title: merged.title,
    description: merged.description,
    path: "/about",
    ogImage: merged.heroImage.src,
  });
}

export default async function AboutPage() {
  const fallback = getStaticPage("about");
  if (!fallback) {
    return null;
  }

  const page = await mergeStaticPageWithCms("page.about", fallback);

  return <AboutPageContent page={page} />;
}
