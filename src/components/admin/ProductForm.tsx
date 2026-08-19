"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminProductCatalog,
  type ProductSpecDraft,
} from "@/components/admin/AdminProductCatalog";
import {
  AdminProductImages,
  type ProductImageDraft,
} from "@/components/admin/AdminProductImages";
import {
  AdminProductOptions,
  type ProductOptionDraft,
} from "@/components/admin/AdminProductOptions";
import { getAuthErrorMessage } from "@/providers/AuthProvider";
import { adminService, type AdminCategory, type AdminProduct } from "@/services/admin.service";
import { slugify } from "@/lib/admin/format";
import { Button } from "@/components/ui/Button";

type ProductFormProps = {
  mode: "create" | "edit";
  initialProduct?: AdminProduct;
};

const defaultForm = {
  slug: "",
  name: "",
  category: "",
  collection: "",
  price: "",
  compareAtPrice: "",
  description: "",
  isActive: true,
};

export function ProductForm({ mode, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState<ProductImageDraft[]>([]);
  const [scaleImageIndex, setScaleImageIndex] = useState<number | null>(null);
  const [specs, setSpecs] = useState<ProductSpecDraft[]>([]);
  const [details, setDetails] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [relatedSlugs, setRelatedSlugs] = useState<string[]>([]);
  const [fabrics, setFabrics] = useState<ProductOptionDraft[]>([]);
  const [finishes, setFinishes] = useState<ProductOptionDraft[]>([]);
  const [sizes, setSizes] = useState<ProductOptionDraft[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories]
  );

  useEffect(() => {
    adminService
      .getCategories()
      .then((response) => {
        const nextCategories = response.data.categories || [];
        setCategories(nextCategories);

        if (!initialProduct && !form.category) {
          const first = nextCategories.find((category) => category.isActive);
          if (first) {
            setForm((current) => ({
              ...current,
              category: first.slug,
              collection: first.slug,
            }));
          }
        }
      })
      .catch(() => setError("Unable to load categories. Create them under Admin → Categories."))
      .finally(() => setIsLoadingCategories(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialProduct) {
      return;
    }

    setForm({
      slug: initialProduct.slug,
      name: initialProduct.name,
      category: initialProduct.category,
      collection: initialProduct.collection,
      price: String(initialProduct.price),
      compareAtPrice: initialProduct.compareAtPrice ? String(initialProduct.compareAtPrice) : "",
      description: initialProduct.description,
      isActive: initialProduct.isActive,
    });

    setImages(
      (initialProduct.images || []).map((image) => ({
        src: image.src,
        alt: image.alt || initialProduct.name,
        width: image.width || 1200,
        height: image.height || 1500,
        hidden: Boolean(image.hidden),
      }))
    );

    setScaleImageIndex(
      typeof initialProduct.scaleImageIndex === "number" ? initialProduct.scaleImageIndex : null
    );
    setSpecs(
      (initialProduct.specs || []).map((spec) => ({
        label: spec.label,
        value: spec.value,
      }))
    );
    setDetails([...(initialProduct.details || [])]);
    setRooms([...(initialProduct.rooms || [])].filter(Boolean));
    setRelatedSlugs([...(initialProduct.relatedSlugs || [])]);

    setFabrics(
      (initialProduct.fabrics || []).map((item) => ({
        id: item.id,
        label: item.label,
        swatch: item.swatch,
      }))
    );
    setFinishes(
      (initialProduct.finishes || []).map((item) => ({
        id: item.id,
        label: item.label,
        swatch: item.swatch,
      }))
    );
    setSizes(
      (initialProduct.sizes || []).map((item) => ({
        id: item.id,
        label: item.label,
      }))
    );
  }, [initialProduct]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!form.category) {
      setError("Select a category.");
      setIsSubmitting(false);
      return;
    }

    if (images.length === 0) {
      setError("Add at least one product image.");
      setIsSubmitting(false);
      return;
    }

    if (!images.some((image) => !image.hidden)) {
      setError("Keep at least one image visible on the website.");
      setIsSubmitting(false);
      return;
    }

    const cleanedSpecs = specs
      .map((spec) => ({
        label: spec.label.trim(),
        value: spec.value.trim(),
      }))
      .filter((spec) => spec.label && spec.value);

    const cleanedDetails = details.map((line) => line.trim()).filter(Boolean);

    const resolvedScaleIndex =
      scaleImageIndex != null && scaleImageIndex >= 0 && scaleImageIndex < images.length
        ? scaleImageIndex
        : null;

    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      category: form.category,
      subcategory: "",
      collection: form.collection.trim() || form.category,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      description: form.description.trim(),
      isActive: form.isActive,
      images: images.map((image) => ({
        src: image.src.trim(),
        alt: image.alt.trim() || form.name.trim(),
        width: image.width || 1200,
        height: image.height || 1500,
        hidden: Boolean(image.hidden),
      })),
      details: cleanedDetails,
      specs: cleanedSpecs,
      fabrics: fabrics.map((item) => ({
        id: item.id,
        label: item.label,
        ...(item.swatch ? { swatch: item.swatch } : {}),
      })),
      finishes: finishes.map((item) => ({
        id: item.id,
        label: item.label,
        ...(item.swatch ? { swatch: item.swatch } : {}),
      })),
      sizes: sizes.map((item) => ({
        id: item.id,
        label: item.label,
      })),
      relatedSlugs,
      rooms,
      scaleImageIndex: resolvedScaleIndex,
    };

    try {
      if (mode === "create") {
        await adminService.createProduct(payload);
        router.push("/admin/products");
        return;
      }

      await adminService.updateProduct(initialProduct!.slug, payload);
      router.push("/admin/products");
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>Name</span>
          <input
            className="admin-input"
            value={form.name}
            onChange={(event) => {
              const name = event.target.value;
              setForm((current) => ({
                ...current,
                name,
                slug: mode === "create" ? slugify(name) : current.slug,
              }));
            }}
            required
          />
        </label>

        <label className="admin-field">
          <span>Slug</span>
          <input
            className="admin-input"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
            required
            disabled={mode === "edit"}
          />
        </label>

        <label className="admin-field">
          <span>Category</span>
          <select
            className="admin-select"
            value={form.category}
            disabled={isLoadingCategories || activeCategories.length === 0}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value,
                collection: event.target.value,
              }))
            }
            required
          >
            <option value="">Select category</option>
            {activeCategories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          {activeCategories.length === 0 && !isLoadingCategories ? (
            <span className="admin-muted" style={{ fontSize: "0.8rem" }}>
              No categories yet.{" "}
              <Link href="/admin/categories" className="admin-inline-link">
                Create categories
              </Link>
            </span>
          ) : null}
        </label>

        <label className="admin-field">
          <span>Collection</span>
          <input
            className="admin-input"
            value={form.collection}
            readOnly
            title="Defaults to the selected category"
          />
          <span className="admin-muted" style={{ fontSize: "0.8rem" }}>
            Same as category by default
          </span>
        </label>

        <label className="admin-field">
          <span>Price (INR)</span>
          <input
            className="admin-input"
            type="number"
            min="0"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            required
          />
        </label>

        <label className="admin-field">
          <span>Compare at price</span>
          <input
            className="admin-input"
            type="number"
            min="0"
            value={form.compareAtPrice}
            onChange={(event) =>
              setForm((current) => ({ ...current, compareAtPrice: event.target.value }))
            }
          />
        </label>

        <label className="admin-field admin-field-full">
          <span>Description</span>
          <textarea
            className="admin-textarea"
            rows={5}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            required
          />
        </label>

        <div className="admin-field admin-field-full">
          <AdminProductImages
            images={images}
            productName={form.name}
            folder={`furalto/products/${form.slug || "drafts"}`}
            scaleImageIndex={scaleImageIndex}
            onChange={setImages}
            onScaleImageIndexChange={setScaleImageIndex}
          />
        </div>

        <div className="admin-field admin-field-full">
          <AdminProductCatalog
            specs={specs}
            details={details}
            rooms={rooms}
            relatedSlugs={relatedSlugs}
            onSpecsChange={setSpecs}
            onDetailsChange={setDetails}
            onRoomsChange={setRooms}
            onRelatedSlugsChange={setRelatedSlugs}
          />
        </div>

        <div className="admin-field admin-field-full">
          <AdminProductOptions
            fabrics={fabrics}
            finishes={finishes}
            sizes={sizes}
            onFabricsChange={setFabrics}
            onFinishesChange={setFinishes}
            onSizesChange={setSizes}
          />
        </div>

        <label className="admin-field admin-checkbox-field">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          <span>Visible on storefront</span>
        </label>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-form-actions">
        <Link href="/admin/products" className="admin-button">
          Cancel
        </Link>
        <Button
          type="submit"
          className="admin-button admin-button-primary"
          isLoading={isSubmitting}
          loadingText="Saving…"
        >
          {mode === "create" ? "Create product" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
