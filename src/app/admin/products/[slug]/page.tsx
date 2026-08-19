"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { adminService, type AdminProduct } from "@/services/admin.service";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.slug) return;

    adminService
      .getProduct(params.slug)
      .then((response) => setProduct(response.data.product))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load product.")
      );
  }, [params.slug]);

  if (error) {
    return (
      <div className="admin-page">
        <AdminPageHeader
          title="Edit Product"
          description="Update product details and visibility."
          actions={
            <Link href="/admin/products" className="admin-button">
              Back to products
            </Link>
          }
        />
        <p className="admin-error">{error}</p>
      </div>
    );
  }

  if (!product) {
    return <p className="admin-muted">Loading product…</p>;
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={`Edit: ${product.name}`}
        description="Update pricing, images, and visibility. Changes save to the live catalogue."
        actions={
          <Link href="/admin/products" className="admin-button">
            Back to products
          </Link>
        }
      />
      <section className="admin-panel">
        <ProductForm mode="edit" initialProduct={product} />
      </section>
    </div>
  );
}
