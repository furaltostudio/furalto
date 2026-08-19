"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import type { ProductSelection } from "@/lib/products/resolve-specs";
import {
  formatCategoryLabel,
  formatInrPrice,
  formatProductName,
  getProductLede,
} from "@/lib/products/format";
import { useCart } from "@/providers/CartProvider";
import { cn } from "@/lib/utils/cn";
import { WishlistButton } from "@/components/product/WishlistButton";
import { Button } from "@/components/ui/Button";

type ProductDetailProps = {
  product: Product;
  selection: ProductSelection;
  onSelectionChange: (selection: ProductSelection) => void;
};

function StarsInline({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="product-stars-inline" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "is-on" : "is-off"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ProductDetail({ product, selection, onSelectionChange }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const selectedFabric = product.fabrics.find((item) => item.id === selection.fabricId);
  const selectedFinish = product.finishes.find((item) => item.id === selection.finishId);
  const selectedSize = product.sizes.find((item) => item.id === selection.sizeId);

  const displayName = useMemo(() => formatProductName(product.name), [product.name]);
  const displayPrice = useMemo(() => formatInrPrice(product.price), [product.price]);
  const collectionLabel = formatCategoryLabel(product.collection || product.category);
  const lede = useMemo(() => getProductLede(product.description), [product.description]);

  const soldCount = product.soldCount ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const averageRating = product.averageRating ?? 0;

  const savingsAmount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice - product.price
      : 0;

  const updateSelection = (patch: Partial<ProductSelection>) => {
    onSelectionChange({ ...selection, ...patch });
  };

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addItem({
        slug: product.slug,
        name: displayName,
        price: product.price,
        image: product.images[0]?.src ?? "",
        fabric: selectedFabric?.label,
        finish: selectedFinish?.label,
        size: selectedSize?.label,
      });
      setIsAdded(true);
      window.setTimeout(() => setIsAdded(false), 1800);
    } catch {
      // Auth redirect handled in CartProvider
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="product-detail">
      <header className="product-detail-header">
        <p className="product-detail-collection">{collectionLabel}</p>
        <h1 className="product-detail-title">{displayName}</h1>

        {reviewCount > 0 ? (
          <a href="#product-reviews" className="product-detail-rating-link">
            <StarsInline rating={averageRating} />
            <span>
              <strong>{averageRating.toFixed(1)}</strong>
              <span className="product-detail-rating-meta">
                · {reviewCount} review{reviewCount === 1 ? "" : "s"}
              </span>
            </span>
          </a>
        ) : null}

        <div className="product-detail-price-block">
          <div className="product-detail-price-row">
            <p className="product-detail-price">{displayPrice}</p>
            {product.compareAtPrice ? (
              <p className="product-detail-compare-price">
                {formatInrPrice(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <p className="product-detail-tax-note">
            Inclusive of 18% GST · Made to order
            {savingsAmount > 0 ? (
              <>
                {" "}
                · You save {formatInrPrice(savingsAmount)}
              </>
            ) : null}
          </p>
          {soldCount > 0 ? (
            <p className="product-detail-sold">{soldCount.toLocaleString("en-IN")} sold</p>
          ) : null}
        </div>
      </header>

      {lede ? <p className="product-detail-description">{lede}</p> : null}

      {product.fabrics.length > 0 ? (
        <OptionGroup
          label="Fabric"
          selectedLabel={selectedFabric?.label}
          options={product.fabrics}
          value={selection.fabricId}
          onChange={(fabricId) => updateSelection({ fabricId })}
        />
      ) : null}

      {product.finishes.length > 0 ? (
        <OptionGroup
          label="Finish"
          selectedLabel={selectedFinish?.label}
          options={product.finishes}
          value={selection.finishId}
          onChange={(finishId) => updateSelection({ finishId })}
        />
      ) : null}

      {product.sizes.length > 0 ? (
        <OptionGroup
          label="Size"
          selectedLabel={selectedSize?.label}
          options={product.sizes}
          value={selection.sizeId}
          onChange={(sizeId) => updateSelection({ sizeId })}
        />
      ) : null}

      <div className="product-detail-actions">
        <Button
          type="button"
          className="product-detail-cta"
          onClick={handleAddToCart}
          isLoading={isAdding}
          loadingText="Adding…"
        >
          {isAdded ? "Added to Cart" : "Add to Cart"}
        </Button>
        <WishlistButton
          slug={product.slug}
          productName={displayName}
          variant="detail"
          className="product-detail-wishlist"
        />
        <button
          type="button"
          className="product-detail-secondary-cta"
          onClick={() => router.push("/appointments")}
        >
          Book a consultation
        </button>
      </div>

      <div className="product-detail-promise">
        <p>White-glove delivery in 10–15 days</p>
        <a href="#product-specs" className="product-detail-specs-link">
          View craft & dimensions
        </a>
      </div>
    </div>
  );
}

type OptionGroupProps = {
  label: string;
  selectedLabel?: string;
  options: { id: string; label: string; swatch?: string }[];
  value: string;
  onChange: (value: string) => void;
};

function OptionGroup({ label, selectedLabel, options, value, onChange }: OptionGroupProps) {
  return (
    <div className="product-option-group">
      <div className="product-option-heading">
        <p className="product-option-label">{label}</p>
        {selectedLabel ? <p className="product-option-selected">{selectedLabel}</p> : null}
      </div>
      <div className="product-option-list" role="listbox" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="option"
            aria-selected={value === option.id}
            className={cn(
              "product-option-btn",
              option.swatch && "product-option-btn-swatch",
              value === option.id && "product-option-btn-active",
            )}
            onClick={() => onChange(option.id)}
          >
            {option.swatch ? (
              <span
                className="product-option-swatch"
                style={{ backgroundColor: option.swatch }}
                aria-hidden="true"
              />
            ) : null}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
