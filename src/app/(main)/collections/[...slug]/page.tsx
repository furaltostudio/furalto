import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { PageHeroWithImage } from "@/components/shared/PageHeroWithImage";
import { CollectionProducts } from "@/components/product/CollectionProducts";
import { Reveal } from "@/components/ui/Reveal";
import { getCollectionEmptyState, getCollectionMeta } from "@/config/collections";
import { getCategoryImage } from "@/config/images";
import { getCollectionCategoryMeta } from "@/lib/content/siteContent";
import {
  COLLECTION_PAGE_SIZE,
  fetchProductsPage,
} from "@/lib/products/catalog";
import { createMetadata } from "@/lib/seo/metadata";

type CollectionPageProps = {
  params: Promise<{ slug: string[] }>;
};

async function resolveMeta(category: string) {
  const fallback = getCollectionMeta(category);
  const cms = await getCollectionCategoryMeta(category);
  if (!cms?.title) {
    return fallback;
  }

  return {
    eyebrow: cms.eyebrow || fallback.eyebrow,
    title: cms.title || fallback.title,
    description: cms.description || fallback.description,
  };
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const category = slug[slug.length - 1];
  const meta = await resolveMeta(category);

  return createMetadata({
    title: meta.title,
    description:
      meta.description ||
      `Shop ${meta.title} from Furalto — handcrafted luxury furniture for modern Indian homes. White-glove delivery available.`,
    path: `/collections/${category}`,
    ogImage: getCategoryImage(category, meta.title).src,
    keywords: [
      meta.title,
      `${category.replace(/-/g, " ")} furniture`,
      "luxury furniture India",
      "Furalto collections",
      "premium home furniture",
    ],
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  // Old room/furniture-type URLs (e.g. /collections/living-room/sofas) collapse
  // to the flat furniture-type collection (e.g. /collections/sofas).
  if (slug.length >= 2) {
    permanentRedirect(`/collections/${slug[slug.length - 1]}`);
  }

  const [category] = slug;

  const meta = await resolveMeta(category);
  const catalog = await fetchProductsPage({
    category,
    limit: COLLECTION_PAGE_SIZE,
    page: 1,
  });
  const heroImage = getCategoryImage(category, meta.title);
  const emptyState = getCollectionEmptyState(category);

  return (
    <>
      <PageHeroWithImage
        className="page-hero-image--collection"
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        image={heroImage}
      />

      <section className="collections-products">
        {catalog.pagination.total === 0 ? (
          <div className="collections-products-inner">
            {emptyState ? (
              <Reveal className="collections-close collections-close--empty">
                <p className="collections-close-kicker">{emptyState.kicker}</p>
                <h2 className="collections-close-title">{emptyState.title}</h2>
                <p className="collections-close-copy">{emptyState.copy}</p>
                <div className="collections-close-actions">
                  <Link href={emptyState.primaryCta.href} className="collections-close-primary">
                    {emptyState.primaryCta.label}
                  </Link>
                  {emptyState.secondaryCta ? (
                    <Link
                      href={emptyState.secondaryCta.href}
                      className="collections-close-secondary"
                    >
                      {emptyState.secondaryCta.label}
                    </Link>
                  ) : null}
                </div>
              </Reveal>
            ) : (
              <p className="collections-empty">No products in this collection yet.</p>
            )}
          </div>
        ) : (
          <CollectionProducts
            category={category}
            initialProducts={catalog.items}
            initialTotal={catalog.pagination.total}
            pageSize={COLLECTION_PAGE_SIZE}
            collectionTitle={meta.title}
          />
        )}
      </section>
    </>
  );
}
