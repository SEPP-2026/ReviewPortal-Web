"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar, Clock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CurrentUser } from "@/hooks/use-current-user";
import type { BackendTool } from "@/lib/backend-api";

const bookingSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(7, "Enter a contact phone number")
    .max(20, "Phone number is too long"),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;

type RentalPeriod = "hourly" | "daily" | "weekly";

interface BookingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: BackendTool;
  user: CurrentUser | null;
  rentalPeriod: RentalPeriod;
  quantity: number;
  duration: number;
  estimatedCost: number | null;
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const periodMeta: Record<RentalPeriod, { unit: string; icon: typeof Clock }> = {
  hourly: { unit: "hour", icon: Clock },
  daily: { unit: "day", icon: Calendar },
  weekly: { unit: "week", icon: Calendar },
};

export function BookingRequestDialog({
  open,
  onOpenChange,
  tool,
  user,
  rentalPeriod,
  quantity,
  duration,
  estimatedCost,
}: BookingRequestDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        fullName: user?.name ?? "",
        email: user?.email ?? "",
        phone: "",
        notes: "",
      });
    }
  }, [open, user, reset]);

  const onSubmit = async (values: BookingValues) => {
    // The backend exposes no bookings endpoint — payments and bookings are
    // out of scope per the project brief. We persist the request in the local
    // Next.js bookings store so the admin shell can review and action it.
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: tool.id,
          toolName: tool.name,
          categoryName: tool.categoryName,
          rentalPeriod,
          quantity,
          duration,
          estimatedCost,
          ...values,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(body.message ?? "Failed to submit booking request.");
      }

      toast.success("Booking request received", {
        description: `Our team will contact ${values.email} to confirm ${tool.name}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Could not submit booking", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    }
  };

  const meta = periodMeta[rentalPeriod];
  const Icon = meta.icon;
  const pluralisedUnit = duration === 1 ? meta.unit : `${meta.unit}s`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Request a booking</DialogTitle>
          <DialogDescription>
            We&apos;ll review your request and confirm availability. Payment is
            arranged at pickup or delivery — nothing is charged online.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{tool.name}</p>
              <p className="text-xs text-slate-600">{tool.categoryName}</p>
            </div>
            <Badge variant="outline">
              <Icon className="mr-1 h-3 w-3" />
              {quantity} × {duration} {pluralisedUnit}
            </Badge>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-slate-600">Estimated total</span>
            <span className="text-lg font-bold text-accent">
              {estimatedCost === null ? "—" : formatCurrency(estimatedCost)}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="booking-name">Full name</Label>
              <Input
                id="booking-name"
                placeholder="Jane Builder"
                aria-invalid={errors.fullName ? "true" : undefined}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-xs text-red-600">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="booking-email">Email</Label>
              <Input
                id="booking-email"
                type="email"
                placeholder="jane@example.com"
                aria-invalid={errors.email ? "true" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="booking-phone">Phone</Label>
            <Input
              id="booking-phone"
              type="tel"
              placeholder="+1 234 567 890"
              aria-invalid={errors.phone ? "true" : undefined}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="booking-notes">Notes (optional)</Label>
            <Textarea
              id="booking-notes"
              rows={3}
              placeholder="Delivery address, preferred start time, anything else we should know..."
              aria-invalid={errors.notes ? "true" : undefined}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {tool.depositRequired && (
            <Alert variant="info">
              <AlertDescription>
                A deposit
                {tool.depositAmount
                  ? ` of ${formatCurrency(tool.depositAmount)}`
                  : ""}{" "}
                will be required at pickup. No payment is collected online.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Confirm booking request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
