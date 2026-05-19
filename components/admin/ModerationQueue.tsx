"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Check,
  Clock3,
  Star,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  getPendingModerationReviews,
  moderateComment,
  moderateReview,
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
  if (Number.isNaN(date.getTime())) return "Recently";
  return formatDistanceToNow(date, { addSuffix: true });
};

const formatRating = (value: number) => value.toFixed(1);

export function ModerationQueue() {
  const [queue, setQueue] = useState<BackendPagedList<BackendReview> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<{
    kind: "review" | "comment";
    id: number;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectingTarget, setRejectingTarget] = useState<{
    kind: "review" | "comment";
    id: number;
  } | null>(null);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getPendingModerationReviews({ page: 1, pageSize: 20 });
      setQueue(data);
    } catch (error) {
      setQueue(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load moderation queue."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const summary = useMemo(() => {
    const reviews = queue?.items ?? [];

    if (reviews.length === 0) {
      return { averageRating: 0, oldestLabel: "No pending reviews" };
    }

    const averageRating =
      reviews.reduce((total, review) => total + review.overallRating, 0) /
      reviews.length;

    const oldestReview = [...reviews].sort(
      (left, right) =>
        new Date(left.createdDate).getTime() -
        new Date(right.createdDate).getTime()
    )[0];

    return {
      averageRating,
      oldestLabel: oldestReview
        ? formatSubmittedDate(oldestReview.createdDate)
        : "Recently",
    };
  }, [queue]);

  const handleApproveReview = async (id: number) => {
    setActiveId({ kind: "review", id });
    setActionError(null);
    try {
      await moderateReview(id, { approved: true });
      await loadQueue();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to approve review."
      );
    } finally {
      setActiveId(null);
    }
  };

  const handleApproveComment = async (id: number) => {
    setActiveId({ kind: "comment", id });
    setActionError(null);
    try {
      await moderateComment(id, { approved: true });
      await loadQueue();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to approve comment."
      );
    } finally {
      setActiveId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingTarget) return;
    setActiveId(rejectingTarget);
    setActionError(null);

    try {
      const reason = rejectionReason.trim() || undefined;
      if (rejectingTarget.kind === "review") {
        await moderateReview(rejectingTarget.id, { approved: false, rejectionReason: reason });
      } else {
        await moderateComment(rejectingTarget.id, { approved: false, rejectionReason: reason });
      }
      setRejectingTarget(null);
      setRejectionReason("");
      await loadQueue();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to reject submission."
      );
    } finally {
      setActiveId(null);
    }
  };

  const reviews = queue?.items ?? [];

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/60 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <Spinner size="md" text="Loading moderation queue..." />
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

  const isBusyOn = (kind: "review" | "comment", id: number) =>
    activeId?.kind === kind && activeId.id === id;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending items</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">
            {queue?.totalCount ?? 0}
          </p>
          <p className="mt-2 text-sm text-slate-600">Reviews waiting for a staff decision.</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Average score</p>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-4xl font-semibold text-slate-950">
              {summary.averageRating.toFixed(1)}
            </p>
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

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

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
                      Pending review
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

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleApproveReview(review.id)}
                  disabled={isBusyOn("review", review.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {isBusyOn("review", review.id) ? "Approving..." : "Approve review"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectingTarget({ kind: "review", id: review.id });
                    setRejectionReason("");
                  }}
                  disabled={isBusyOn("review", review.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>

              {review.comments && review.comments.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Pending comments on this review ({review.comments.filter((c) => c.status.toLowerCase() === "pending").length})
                  </p>
                  <div className="mt-3 space-y-3">
                    {review.comments
                      .filter((comment) => comment.status.toLowerCase() === "pending")
                      .map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {comment.commenterName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatSubmittedDate(comment.createdDate)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-slate-700">{comment.commentText}</p>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleApproveComment(comment.id)}
                              disabled={isBusyOn("comment", comment.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <Check className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingTarget({ kind: "comment", id: comment.id });
                                setRejectionReason("");
                              }}
                              disabled={isBusyOn("comment", comment.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {rejectingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-950">
              Reject {rejectingTarget.kind === "review" ? "review" : "comment"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Provide a brief reason. This is stored on the submission for the audit trail.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={4}
              placeholder="Reason for rejection (optional)"
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectingTarget(null);
                  setRejectionReason("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={
                  rejectingTarget
                    ? isBusyOn(rejectingTarget.kind, rejectingTarget.id)
                    : false
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
