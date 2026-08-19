import { CollectionCategoryGrid } from "@/components/collections/CollectionCategoryGrid";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { categoryShowcaseItems } from "@/config/category-showcase";
import { categoryImages } from "@/config/images";
import { getCollectionsHubContent } from "@/lib/content/siteContent";
import { createMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const hub = await getCollectionsHubContent();
  return createMetadata({
    title: hub.title,
    description: hub.description,
    path: "/collections",
  });
}

export default async function CollectionsIndexPage() {
  const hub = await getCollectionsHubContent();

  return (
    <>
      <PageHeroWithImage
        eyebrow={hub.eyebrow}
        title={hub.title}
        description={hub.description}
        image={categoryImages.inspiration}
      />

      <section className="collections-index">
        <div className="container-app pb-14 sm:pb-20">
          <CollectionCategoryGrid items={categoryShowcaseItems} />
        </div>
      </section>
    </>
  );
}
