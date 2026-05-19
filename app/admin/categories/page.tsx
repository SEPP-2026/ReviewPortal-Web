import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaffUser } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCategoriesManager } from "@/components/admin/AdminCategoriesManager";

export const metadata: Metadata = {
  title: "Manage Categories | Shelton Tool-Hire",
  description: "Create, edit, and remove tool categories.",
};

export default async function AdminCategoriesPage() {
  const user = await requireStaffUser("/admin/categories");

  if (user.role !== "Admin") {
    redirect("/admin/moderation");
  }

  return (
    <AdminShell
      title="Categories"
      description="Organise tools into categories. Categories with active tools cannot be deleted."
      userName={user.name}
      userRole={user.role}
    >
      <AdminCategoriesManager />
    </AdminShell>
  );
}
