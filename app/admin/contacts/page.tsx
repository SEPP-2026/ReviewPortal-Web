import type { Metadata } from "next";
import { requireStaffUser } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContactsManager } from "@/components/admin/ContactsManager";

export const metadata: Metadata = {
  title: "Messages | Shelton Tool-Hire",
  description: "Enquiries submitted by customers through the contact form.",
};

export default async function AdminContactsPage() {
  const user = await requireStaffUser("/admin/contacts");

  return (
    <AdminShell
      title="Messages"
      description="Enquiries submitted through the public contact form. Reply by email or phone."
      userName={user.name}
      userRole={user.role}
    >
      <ContactsManager />
    </AdminShell>
  );
}
