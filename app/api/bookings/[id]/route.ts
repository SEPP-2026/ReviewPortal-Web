import { NextResponse, type NextRequest } from "next/server";
import {
  getBooking,
  updateBookingStatus,
  type BookingStatus,
} from "@/lib/bookings-store";
import { getSessionUser, isStaff } from "@/lib/session";

const ALLOWED_STATUSES: ReadonlySet<BookingStatus> = new Set([
  "Pending",
  "Confirmed",
  "Declined",
  "Completed",
]);

interface PatchPayload {
  status?: BookingStatus;
  adminNote?: string;
}

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 },
    );
  }
  if (!isStaff(user)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!getBooking(id)) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }

  let payload: PatchPayload;
  try {
    payload = (await request.json()) as PatchPayload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.status || !ALLOWED_STATUSES.has(payload.status)) {
    return NextResponse.json(
      { message: "status must be Pending, Confirmed, Declined, or Completed" },
      { status: 400 },
    );
  }

  const updated = updateBookingStatus(id, payload.status, payload.adminNote);
  return NextResponse.json(updated);
};
