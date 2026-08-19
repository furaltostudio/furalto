import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Add product"
        description="Create a new catalogue item. Fill the fields, upload an image, and save — it will appear in the store."
        actions={
          <Link href="/admin/products" className="admin-button">
            Back to products
          </Link>
        }
      />
      <section className="admin-panel">
        <ProductForm mode="create" />
      </section>
    </div>
  );
}
