// In-memory booking request store for the prototype.
//
// Why this exists: the backend API has no bookings endpoint (payments / real
// booking are explicitly out of scope per the project brief), but the customer
// flow needs somewhere to persist booking requests so the admin shell can show
// them. This module keeps records in process memory and survives Next.js HMR
// via globalThis. Production-grade persistence would require a backend table.

import { paginate, type PagedResult } from "@/lib/pagination";

export type BookingStatus = "Pending" | "Confirmed" | "Declined" | "Completed";

export type RentalPeriod = "hourly" | "daily" | "weekly";

export interface BookingRecord {
  id: string;
  toolId: number;
  toolName: string;
  categoryName: string;
  rentalPeriod: RentalPeriod;
  quantity: number;
  duration: number;
  estimatedCost: number | null;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  userId?: number;
  status: BookingStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

type Globals = typeof globalThis & {
  __reviewPortalBookings?: BookingRecord[];
};

const globalsRef = globalThis as Globals;
if (!globalsRef.__reviewPortalBookings) {
  globalsRef.__reviewPortalBookings = [];
}
const bookings: BookingRecord[] = globalsRef.__reviewPortalBookings;

const generateId = () => {
  const random = Math.random().toString(36).slice(2, 8);
  const timestamp = Date.now().toString(36);
  return `bk_${timestamp}_${random}`;
};

export type BookingCreateInput = Omit<
  BookingRecord,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export const addBooking = (input: BookingCreateInput): BookingRecord => {
  const now = new Date().toISOString();
  const record: BookingRecord = {
    ...input,
    id: generateId(),
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  };
  bookings.unshift(record);
  return record;
};

export interface ListBookingsFilter {
  status?: BookingStatus;
  userId?: number;
  page?: number;
  pageSize?: number;
}

export const listBookings = (
  filter: ListBookingsFilter = {},
): PagedResult<BookingRecord> => {
  let result = [...bookings];
  if (filter.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  if (filter.userId !== undefined) {
    result = result.filter((b) => b.userId === filter.userId);
  }
  return paginate(result, filter.page, filter.pageSize);
};

export const getBooking = (id: string): BookingRecord | undefined =>
  bookings.find((b) => b.id === id);

export const updateBookingStatus = (
  id: string,
  status: BookingStatus,
  adminNote?: string,
): BookingRecord | undefined => {
  const booking = bookings.find((b) => b.id === id);
  if (!booking) return undefined;
  booking.status = status;
  if (adminNote !== undefined) {
    booking.adminNote = adminNote.trim() ? adminNote.trim() : undefined;
  }
  booking.updatedAt = new Date().toISOString();
  return booking;
};

export const getBookingsCount = () => bookings.length;

/** Counts per status across ALL bookings (for accurate summary cards under pagination). */
export const getBookingStatusCounts = (): Record<BookingStatus, number> => {
  const counts: Record<BookingStatus, number> = {
    Pending: 0,
    Confirmed: 0,
    Declined: 0,
    Completed: 0,
  };
  for (const booking of bookings) {
    counts[booking.status] += 1;
  }
  return counts;
};
