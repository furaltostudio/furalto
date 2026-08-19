"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductSpecsPanel } from "@/components/product/ProductSpecsPanel";
import { formatProductName } from "@/lib/products/format";
import { getDefaultSelection, type ProductSelection } from "@/lib/products/resolve-specs";

type ProductBuyLayoutProps = {
  product: Product;
};

export function ProductBuyLayout({ product }: ProductBuyLayoutProps) {
  const [selection, setSelection] = useState<ProductSelection>(() =>
    getDefaultSelection(product)
  );
  const displayName = formatProductName(product.name);

  return (
    <div className="product-buy-layout">
      <div className="product-page-grid">
        <div className="product-gallery-sticky">
          <ProductGallery
            images={product.images}
            productName={displayName}
            productSlug={product.slug}
            specs={product.specs}
            scaleImageIndex={product.scaleImageIndex}
          />
        </div>
        <ProductDetail
          product={product}
          selection={selection}
          onSelectionChange={setSelection}
        />
      </div>

      <ProductSpecsPanel product={product} selection={selection} />
    </div>
  );
}
