"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Clock3,
  Star,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  getPendingModerationReviews,
  type BackendPagedList,
  type BackendReview,
} from "@/lib/backend-api";

const ratingFields = [
  { key: "equipmentRating", label: "Equipment" },
  { key: "customerServiceRating", label: "Service" },
  { key: "technicalSupportRating", label: "Support" },
  { key: "afterSalesRating", label: "After-sales" },
  { key: "valueForMoneyRating", label: "Value" },
] as const;

const formatSubmittedDate = (isoDate: string) => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return formatDistanceToNow(date, { addSuffix: true });
};

const formatRating = (value: number) => value.toFixed(1);

const getStatusLabel = (status: string) =>
  status.toLowerCase() === "pending" ? "Pending review" : status;

export function ModerationQueue() {
  const [queue, setQueue] = useState<BackendPagedList<BackendReview> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadQueue = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getPendingModerationReviews({ page: 1, pageSize: 20 });

        if (!isMounted) {
          return;
        }

        setQueue(data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setQueue(null);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load moderation queue."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadQueue();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const reviews = queue?.items ?? [];

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        oldestLabel: "No pending reviews",
      };
    }

    const averageRating =
      reviews.reduce((total, review) => total + review.overallRating, 0) /
      reviews.length;

    const oldestReview = [...reviews].sort(
      (left, right) =>
        new Date(left.createdDate).getTime() - new Date(right.createdDate).getTime()
    )[0];

    return {
      averageRating,
      oldestLabel: oldestReview ? formatSubmittedDate(oldestReview.createdDate) : "Recently",
    };
  }, [queue]);

  const reviews = queue?.items ?? [];

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/60 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3 text-slate-500">
          <Clock3 className="h-5 w-5 animate-pulse text-amber-500" />
          Loading moderation queue...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold">Unable to load reviews</h2>
            <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending items</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">{queue?.totalCount ?? 0}</p>
          <p className="mt-2 text-sm text-slate-600">Reviews waiting for a staff decision.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Average score</p>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-4xl font-semibold text-slate-950">{summary.averageRating.toFixed(1)}</p>
            <div className="mb-1 flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium text-slate-500">pending only</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600">Useful for checking review quality at a glance.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Oldest review</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{summary.oldestLabel}</p>
          <p className="mt-2 text-sm text-slate-600">Oldest pending submission in the queue.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">No pending reviews</h2>
          <p className="mt-2 text-slate-600">
            Everything in the review workflow is currently published or waiting elsewhere in moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-3xl border border-amber-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-900">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Pending
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      {getStatusLabel(review.status)}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">{review.toolName}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-slate-400" />
                        {review.reviewerName}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-slate-400" />
                        Submitted {formatSubmittedDate(review.createdDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Overall rating</p>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span className="text-3xl font-semibold text-slate-950">
                      {formatRating(review.overallRating)}
                    </span>
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              </div>

              <p className="mt-6 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-slate-700">
                {review.reviewText}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {ratingFields.map((field) => {
                  const value = review[field.key];

                  return (
                    <div key={field.key} className="rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{field.label}</p>
                      <div className="mt-2 flex items-center gap-2 text-slate-950">
                        <span className="text-xl font-semibold">{value.toFixed(1)}</span>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}