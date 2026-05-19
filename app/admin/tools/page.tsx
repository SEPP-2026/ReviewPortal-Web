import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireStaffUser } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminToolsManager } from "@/components/admin/AdminToolsManager";

export const metadata: Metadata = {
  title: "Manage Tools | Shelton Tool-Hire",
  description: "Create, edit, and manage the catalogue of rental tools.",
};

export default async function AdminToolsPage() {
  const user = await requireStaffUser("/admin/tools");

  if (user.role !== "Admin") {
    redirect("/admin/moderation");
  }

  return (
    <AdminShell
      title="Tool Catalogue"
      description="Create new tools, update details, toggle availability, and manage images."
      userName={user.name}
      userRole={user.role}
    >
      <AdminToolsManager />
    </AdminShell>
  );
}
