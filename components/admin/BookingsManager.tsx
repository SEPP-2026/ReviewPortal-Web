"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  RotateCcw,
  ShieldX,
  Sparkles,
  StickyNote,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BookingRecord, BookingStatus } from "@/lib/bookings-store";

const STATUS_FILTERS: Array<{ label: string; value: "" | BookingStatus }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Completed", value: "Completed" },
  { label: "Declined", value: "Declined" },
];

const PERIOD_LABEL: Record<BookingRecord["rentalPeriod"], string> = {
  hourly: "hour",
  daily: "day",
  weekly: "week",
};

const STATUS_VARIANT: Record<
  BookingStatus,
  "warning" | "success" | "danger" | "secondary"
> = {
  Pending: "warning",
  Confirmed: "success",
  Declined: "danger",
  Completed: "secondary",
};

const formatCurrency = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

interface ApiBookingsResponse {
  items: BookingRecord[];
}

interface BusyState {
  id: string;
  action: BookingStatus;
}

export function BookingsManager() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | BookingStatus>("");
  const [busy, setBusy] = useState<BusyState | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const search = statusFilter ? `?status=${statusFilter}` : "";
      const response = await fetch(`/api/bookings${search}`);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("You don't have access to view bookings.");
        }
        throw new Error("Failed to load bookings.");
      }
      const data = (await response.json()) as ApiBookingsResponse;
      setBookings(data.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load bookings.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const initial: Record<BookingStatus, number> = {
      Pending: 0,
      Confirmed: 0,
      Declined: 0,
      Completed: 0,
    };
    return bookings.reduce((acc, booking) => {
      acc[booking.status] += 1;
      return acc;
    }, initial);
  }, [bookings]);

  const handleStatusChange = async (
    booking: BookingRecord,
    nextStatus: BookingStatus,
  ) => {
    const note =
      nextStatus === "Declined"
        ? window.prompt("Reason for declining (shared with the customer):", "") ?? undefined
        : undefined;

    if (nextStatus === "Declined" && note === undefined) {
      // user cancelled the prompt
      return;
    }

    setBusy({ id: booking.id, action: nextStatus });
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, adminNote: note }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(body.message ?? "Failed to update booking.");
      }
      const updated = (await response.json()) as BookingRecord;
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)),
      );
      toast.success(`Booking ${nextStatus.toLowerCase()}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update booking.",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Clock}
          label="Pending"
          value={counts.Pending}
          tone="amber"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Confirmed"
          value={counts.Confirmed}
          tone="emerald"
        />
        <SummaryCard
          icon={Sparkles}
          label="Completed"
          value={counts.Completed}
          tone="slate"
        />
        <SummaryCard
          icon={ShieldX}
          label="Declined"
          value={counts.Declined}
          tone="rose"
        />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {STATUS_FILTERS.map((filter) => {
              const active = statusFilter === filter.value;
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={load}
            disabled={isLoading}
            className="rounded-md"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            {errorMessage}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-md border border-slate-200 bg-white p-10">
          <Spinner size="md" text="Loading bookings..." />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-900">
            No bookings yet.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Booking requests submitted by customers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-md border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/equipment/${booking.toolId}`}
                      className="text-base font-semibold text-slate-900 hover:text-accent"
                    >
                      {booking.toolName}
                    </Link>
                    <Badge variant="outline">{booking.categoryName}</Badge>
                    <Badge variant={STATUS_VARIANT[booking.status]}>
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Requested {formatDate(booking.createdAt)}
                    {booking.updatedAt !== booking.createdAt && (
                      <> · updated {formatDate(booking.updatedAt)}</>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Estimated total
                  </p>
                  <p className="text-lg font-bold text-accent">
                    {formatCurrency(booking.estimatedCost)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                <DetailRow icon={Calendar} label="Period">
                  {booking.quantity} × {booking.duration}{" "}
                  {PERIOD_LABEL[booking.rentalPeriod]}
                  {booking.duration === 1 ? "" : "s"}
                </DetailRow>
                <DetailRow icon={User} label="Customer">
                  {booking.fullName}
                  {booking.userId && (
                    <span className="ml-1 text-xs text-slate-500">
                      (account #{booking.userId})
                    </span>
                  )}
                </DetailRow>
                <DetailRow icon={Mail} label="Email">
                  <a
                    href={`mailto:${booking.email}`}
                    className="hover:text-accent"
                  >
                    {booking.email}
                  </a>
                </DetailRow>
                <DetailRow icon={Phone} label="Phone">
                  <a
                    href={`tel:${booking.phone}`}
                    className="hover:text-accent"
                  >
                    {booking.phone}
                  </a>
                </DetailRow>
              </div>

              {booking.notes && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <StickyNote className="mt-0.5 h-4 w-4 text-slate-500" />
                  <p className="whitespace-pre-line">{booking.notes}</p>
                </div>
              )}

              {booking.adminNote && (
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <strong className="font-semibold">Staff note:</strong>{" "}
                  {booking.adminNote}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                {booking.status !== "Confirmed" && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={busy?.id === booking.id}
                    onClick={() => handleStatusChange(booking, "Confirmed")}
                    className="rounded-md"
                  >
                    Confirm
                  </Button>
                )}
                {booking.status !== "Completed" && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={busy?.id === booking.id}
                    onClick={() => handleStatusChange(booking, "Completed")}
                    className="rounded-md"
                  >
                    Mark completed
                  </Button>
                )}
                {booking.status !== "Declined" && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={busy?.id === booking.id}
                    onClick={() => handleStatusChange(booking, "Declined")}
                    className="rounded-md"
                  >
                    Decline
                  </Button>
                )}
                {booking.status !== "Pending" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy?.id === booking.id}
                    onClick={() => handleStatusChange(booking, "Pending")}
                    className="rounded-md"
                  >
                    Reopen
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const toneIconClasses = {
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
} as const;

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: keyof typeof toneIconClasses;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className={`rounded-md p-1.5 ${toneIconClasses[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}
