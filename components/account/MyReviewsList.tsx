"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star, MessageCircle, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  getMyReviews,
  type BackendPagedList,
  type BackendReviewSummary,
} from "@/lib/backend-api";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const statusBadge = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "approved") {
    return {
      className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
      label: "Approved",
    };
  }
  if (normalized === "rejected") {
    return {
      className: "border border-rose-200 bg-rose-50 text-rose-700",
      icon: AlertCircle,
      label: "Rejected",
    };
  }
  return {
    className: "border border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
    label: "Pending",
  };
};

export function MyReviewsList() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BackendPagedList<BackendReviewSummary> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await getMyReviews({ page, pageSize: 10 });
      setData(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load your reviews."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-10">
        <Spinner size="md" text="Loading your reviews..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  const reviews = data?.items ?? [];

  if (reviews.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
        You have not submitted any reviews yet. Browse{" "}
        <Link href="/equipment" className="font-medium text-accent hover:underline">
          our equipment
        </Link>{" "}
        and leave your first review.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const badge = statusBadge(review.status);
        const BadgeIcon = badge.icon;
        return (
          <div
            key={review.id}
            className="rounded-md border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  href={`/equipment/${review.toolId}`}
                  className="text-base font-semibold text-slate-900 hover:text-accent"
                >
                  {review.toolName}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  Submitted {formatDate(review.createdDate)}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
              >
                <BadgeIcon className="h-3.5 w-3.5" />
                {badge.label}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(review.overallRating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {review.overallRating.toFixed(1)}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-700">
              {review.reviewTextSnippet}
            </p>

            {review.rejectionReason && (
              <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <p className="font-semibold">Reason for rejection</p>
                <p className="mt-1">{review.rejectionReason}</p>
              </div>
            )}

            {review.hasCompanyResponse && (
              <div className="mt-3 rounded-md border-l-2 border-accent bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-900">
                  Company response attached
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  View the full review to see the company&apos;s reply.
                </p>
              </div>
            )}

            <div className="mt-3 flex items-center gap-3 text-xs">
              <Link
                href={`/equipment/${review.toolId}`}
                className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                View full review
              </Link>
            </div>
          </div>
        );
      })}

      {data && (data.hasPreviousPage || data.hasNextPage) && (
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={!data.hasPreviousPage}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!data.hasNextPage}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
