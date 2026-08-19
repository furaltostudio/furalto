import { Suspense } from "react";
import AdminOrdersPage from "./AdminOrdersPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="admin-muted">Loading orders...</p>}>
      <AdminOrdersPage />
    </Suspense>
  );
}
