import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductBuyLayout } from "@/components/product/ProductBuyLayout";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/layout/JsonLd";
import { RelatedProductsCarousel } from "@/components/product/RelatedProductsCarousel";
import { ProductReviews } from "@/components/product/ProductReviews";
import {
  fetchProductBySlug,
  fetchProductReviews,
  fetchProductSlugs,
  fetchRelatedProducts,
} from "@/lib/products/catalog";
import { formatCategoryLabel, formatProductName } from "@/lib/products/format";
import { createMetadata } from "@/lib/seo/metadata";
import {
  getBreadcrumbJsonLd,
  getProductJsonLd,
  getProductSeoDescription,
} from "@/lib/seo/jsonld";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await fetchProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return createMetadata({ title: "Product Not Found", noIndex: true });
  }

  const categoryLabel = formatCategoryLabel(product.category);

  return createMetadata({
    title: `${formatProductName(product.name)} | ${categoryLabel}`,
    description: getProductSeoDescription(product),
    path: `/products/${product.slug}`,
    ogImage: product.images[0]?.src,
    keywords: [
      formatProductName(product.name),
      `${categoryLabel} furniture`,
      `${formatCategoryLabel(product.collection)} collection`,
      "luxury furniture India",
      "Furalto",
      ...product.rooms.map((room) => `${formatCategoryLabel(room)} furniture`),
    ],
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, reviewsResult] = await Promise.all([
    fetchRelatedProducts(slug),
    fetchProductReviews(slug),
  ]);
  const categoryLabel = formatCategoryLabel(product.category);
  const displayName = formatProductName(product.name);
  const reviews = reviewsResult?.reviews ?? [];
  const averageRating = reviewsResult?.product.averageRating ?? product.averageRating ?? 0;
  const reviewCount = reviewsResult?.product.reviewCount ?? product.reviewCount ?? 0;
  const soldCount = reviewsResult?.product.soldCount ?? product.soldCount ?? 0;
  const recommendPercent = reviewsResult?.product.recommendPercent ?? 0;
  const featuredReview = reviewsResult?.featuredReview ?? null;
  const ratingDistribution = reviewsResult?.product.ratingDistribution ?? {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const productWithSocial = {
    ...product,
    soldCount,
    averageRating,
    reviewCount,
    recommendPercent,
    ratingDistribution,
  };

  return (
    <>
      <JsonLd
        data={[
          getProductJsonLd(productWithSocial),
          getBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Collections", path: "/collections" },
            { name: categoryLabel, path: `/collections/${product.category}` },
            { name: displayName, path: `/products/${product.slug}` },
          ]),
        ]}
      />

      <section className="product-page">
        <div className="container-app product-page-inner">
          <nav className="product-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/collections/${product.category}`}>{categoryLabel}</Link>
            <span aria-hidden="true">/</span>
            <span>{displayName}</span>
          </nav>

          <ProductBuyLayout product={productWithSocial} />
        </div>
      </section>

      <section className="product-reviews-section">
        <div className="container-app">
          <Reveal>
            <ProductReviews
              productName={displayName}
              averageRating={averageRating}
              reviewCount={reviewCount}
              recommendPercent={recommendPercent}
              ratingDistribution={ratingDistribution}
              featuredReview={featuredReview}
              reviews={reviews}
            />
          </Reveal>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <RelatedProductsCarousel
          products={relatedProducts}
          categoryLabel={categoryLabel}
        />
      ) : null}
    </>
  );
}
