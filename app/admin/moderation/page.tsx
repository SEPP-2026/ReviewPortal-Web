import type { Metadata } from "next";
import { requireStaffUser } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { ModerationQueue } from "@/components/admin/ModerationQueue";

export const metadata: Metadata = {
  title: "Moderation Queue | Shelton Tool-Hire",
  description:
    "Review and moderate pending customer submissions before publishing.",
};

export default async function ModerationPage() {
  const user = await requireStaffUser("/admin/moderation");

  return (
    <AdminShell
      title="Moderation Queue"
      description="Review pending customer submissions, check the user and rating details, and decide whether each review should be published."
      userName={user.name}
      userRole={user.role}
    >
      <ModerationQueue />
    </AdminShell>
  );
}
