import type { Metadata } from "next";
import { requireStaffUser } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Dashboard | Shelton Tool-Hire",
  description: "Operational snapshot of equipment, reviews and moderation.",
};

export default async function AdminDashboardPage() {
  const user = await requireStaffUser("/admin");

  if (user.role !== "Admin") {
    redirect("/admin/moderation");
  }

  return (
    <AdminShell
      title="Admin Dashboard"
      description="A snapshot of equipment health, moderation backlog, and top-performing tools."
      userName={user.name}
      userRole={user.role}
    >
      <AdminDashboard />
    </AdminShell>
  );
}
