import { NextResponse, type NextRequest } from "next/server";
import {
  addBooking,
  listBookings,
  getBookingStatusCounts,
  type BookingStatus,
  type RentalPeriod,
} from "@/lib/bookings-store";
import { getSessionUser, isStaff } from "@/lib/session";

const ALLOWED_PERIODS: ReadonlySet<RentalPeriod> = new Set([
  "hourly",
  "daily",
  "weekly",
]);
const ALLOWED_STATUSES: ReadonlySet<BookingStatus> = new Set([
  "Pending",
  "Confirmed",
  "Declined",
  "Completed",
]);

interface BookingPayload {
  toolId?: number;
  toolName?: string;
  categoryName?: string;
  rentalPeriod?: RentalPeriod;
  quantity?: number;
  duration?: number;
  estimatedCost?: number | null;
  fullName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const validate = (payload: BookingPayload): string | null => {
  if (!isFiniteNumber(payload.toolId) || payload.toolId <= 0)
    return "toolId is required";
  if (!payload.toolName || typeof payload.toolName !== "string")
    return "toolName is required";
  if (!payload.categoryName || typeof payload.categoryName !== "string")
    return "categoryName is required";
  if (!payload.rentalPeriod || !ALLOWED_PERIODS.has(payload.rentalPeriod))
    return "rentalPeriod must be hourly, daily, or weekly";
  if (!isFiniteNumber(payload.quantity) || payload.quantity < 1)
    return "quantity must be at least 1";
  if (!isFiniteNumber(payload.duration) || payload.duration < 1)
    return "duration must be at least 1";
  if (!payload.fullName || typeof payload.fullName !== "string")
    return "fullName is required";
  if (!payload.email || typeof payload.email !== "string")
    return "email is required";
  if (!payload.phone || typeof payload.phone !== "string")
    return "phone is required";
  return null;
};

export const POST = async (request: NextRequest) => {
  let payload: BookingPayload;
  try {
    payload = (await request.json()) as BookingPayload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const error = validate(payload);
  if (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }

  const sessionUser = await getSessionUser();

  const booking = addBooking({
    toolId: payload.toolId!,
    toolName: payload.toolName!.trim(),
    categoryName: payload.categoryName!.trim(),
    rentalPeriod: payload.rentalPeriod!,
    quantity: Math.floor(payload.quantity!),
    duration: Math.floor(payload.duration!),
    estimatedCost:
      payload.estimatedCost === null || payload.estimatedCost === undefined
        ? null
        : Number(payload.estimatedCost),
    fullName: payload.fullName!.trim(),
    email: payload.email!.trim(),
    phone: payload.phone!.trim(),
    notes: payload.notes?.trim() || undefined,
    userId: sessionUser?.id,
  });

  return NextResponse.json(booking, { status: 201 });
};

export const GET = async (request: NextRequest) => {
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

  const statusParam = request.nextUrl.searchParams.get("status");
  const filterStatus =
    statusParam && ALLOWED_STATUSES.has(statusParam as BookingStatus)
      ? (statusParam as BookingStatus)
      : undefined;

  const page = Number(request.nextUrl.searchParams.get("page")) || 1;
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize")) || 10;

  return NextResponse.json({
    ...listBookings({ status: filterStatus, page, pageSize }),
    statusCounts: getBookingStatusCounts(),
  });
};
