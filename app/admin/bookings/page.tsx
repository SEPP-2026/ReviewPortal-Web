import type { Metadata } from "next";
import { requireStaffUser } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingsManager } from "@/components/admin/BookingsManager";

export const metadata: Metadata = {
  title: "Bookings | Shelton Tool-Hire",
  description: "Review and action equipment booking requests submitted by customers.",
};

export default async function AdminBookingsPage() {
  const user = await requireStaffUser("/admin/bookings");

  return (
    <AdminShell
      title="Bookings"
      description="Review pending booking requests, confirm availability, or decline with a note. Payment is handled at pickup or delivery."
      userName={user.name}
      userRole={user.role}
    >
      <BookingsManager />
    </AdminShell>
  );
}
