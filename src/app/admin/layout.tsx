import { RequireRole } from "@/components/admin/RequireRole";
import { AdminShell } from "@/components/admin/AdminShell";
import { STAFF_ROLES } from "@/lib/auth/roles";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={STAFF_ROLES}>
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}
