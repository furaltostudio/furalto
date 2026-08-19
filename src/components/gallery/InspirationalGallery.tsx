import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

type InspirationalGalleryProps = {
  products: Product[];
};

export function InspirationalGallery({ products }: InspirationalGalleryProps) {
  return (
    <section className="gallery-section">
      <div className="container-app">
        <div className="gallery-grid">
          {products.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              variant="gallery"
              priority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
