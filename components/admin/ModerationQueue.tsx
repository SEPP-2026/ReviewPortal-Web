"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Check,
  Clock3,
  Star,
  ShieldCheck,
  MessageCircle,
  UserRound,
  X,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getPendingModerationReviews,
  moderateComment,
  moderateReview,
  type BackendPagedList,
  type BackendModerationItem,
} from "@/lib/backend-api";
import {
  rejectionReasonSchema,
  type RejectionReasonValues,
} from "@/lib/form-schemas";

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

const formatRating = (value: number | null) =>
  value != null ? value.toFixed(1) : "—";

export function ModerationQueue() {
  const [queue, setQueue] = useState<BackendPagedList<BackendModerationItem> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<{
    kind: "review" | "comment";
    id: number;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectingTarget, setRejectingTarget] = useState<{
    kind: "review" | "comment";
    id: number;
  } | null>(null);

  const rejectionForm = useForm<RejectionReasonValues>({
    resolver: zodResolver(rejectionReasonSchema),
    defaultValues: { reason: "" },
  });

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getPendingModerationReviews({ page: 1, pageSize: 50 });
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

  const items = queue?.items ?? [];

  const reviewItems = useMemo(
    () => items.filter((item) => item.itemType.toLowerCase() === "review"),
    [items]
  );

  const commentItems = useMemo(
    () => items.filter((item) => item.itemType.toLowerCase() === "comment"),
    [items]
  );

  const summary = useMemo(() => {
    if (reviewItems.length === 0) {
      return { averageRating: 0, oldestLabel: "No pending reviews" };
    }

    const ratedReviews = reviewItems.filter((r) => r.overallRating != null);
    const averageRating =
      ratedReviews.length > 0
        ? ratedReviews.reduce((total, r) => total + (r.overallRating ?? 0), 0) /
          ratedReviews.length
        : 0;

    const oldestReview = [...reviewItems].sort(
      (left, right) =>
        new Date(left.submittedDate).getTime() -
        new Date(right.submittedDate).getTime()
    )[0];

    return {
      averageRating,
      oldestLabel: oldestReview
        ? formatSubmittedDate(oldestReview.submittedDate)
        : "Recently",
    };
  }, [reviewItems]);

  const handleApproveReview = async (id: number) => {
    setActiveId({ kind: "review", id });
    setActionError(null);
    try {
      await moderateReview(id, { approved: true });
      toast.success("Review approved");
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
      toast.success("Comment approved");
      await loadQueue();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to approve comment."
      );
    } finally {
      setActiveId(null);
    }
  };

  const handleConfirmReject = async (values: RejectionReasonValues) => {
    if (!rejectingTarget) return;
    setActiveId(rejectingTarget);
    setActionError(null);

    try {
      const reason = values.reason.trim();
      if (rejectingTarget.kind === "review") {
        await moderateReview(rejectingTarget.id, {
          approved: false,
          rejectionReason: reason,
        });
      } else {
        await moderateComment(rejectingTarget.id, {
          approved: false,
          rejectionReason: reason,
        });
      }
      toast.success(
        `${rejectingTarget.kind === "review" ? "Review" : "Comment"} rejected`,
      );
      setRejectingTarget(null);
      rejectionForm.reset({ reason: "" });
      await loadQueue();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to reject submission."
      );
    } finally {
      setActiveId(null);
    }
  };

  const openReject = (kind: "review" | "comment", id: number) => {
    rejectionForm.reset({ reason: "" });
    setRejectingTarget({ kind, id });
  };

  const closeReject = () => {
    setRejectingTarget(null);
    rejectionForm.reset({ reason: "" });
  };

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-8">
        <Spinner size="md" text="Loading moderation queue..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-6 text-red-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="text-base font-semibold">Unable to load reviews</h2>
            <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const isBusyOn = (kind: "review" | "comment", id: number) =>
    activeId?.kind === kind && activeId.id === id;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Pending items
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {queue?.totalCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {reviewItems.length} review{reviewItems.length !== 1 ? "s" : ""},{" "}
            {commentItems.length} comment{commentItems.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Average score
          </p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-semibold tracking-tight text-slate-900">
              {summary.averageRating.toFixed(1)}
            </p>
            <Star className="mb-1.5 h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Across pending submissions only.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Oldest review
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {summary.oldestLabel}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Oldest pending submission in the queue.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            No pending reviews
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Everything in the review workflow is currently published or waiting elsewhere in moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending Reviews */}
          {reviewItems.map((item) => (
            <article
              key={`review-${item.itemId}`}
              className="rounded-md border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Pending review
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {item.toolName}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5 text-slate-400" />
                        {item.authorName}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                        Submitted {formatSubmittedDate(item.submittedDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {item.overallRating != null && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2.5 text-right">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      Overall rating
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <span className="text-2xl font-semibold text-slate-900">
                        {formatRating(item.overallRating)}
                      </span>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {item.text}
              </p>

              {item.equipmentRating != null && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {ratingFields.map((field) => {
                    const value = item[field.key];
                    return (
                      <div
                        key={field.key}
                        className="rounded-md border border-slate-200 px-3 py-2"
                      >
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                          {field.label}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-slate-900">
                          <span className="text-base font-semibold">
                            {value != null ? value.toFixed(1) : "—"}
                          </span>
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleApproveReview(item.itemId)}
                  disabled={isBusyOn("review", item.itemId)}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {isBusyOn("review", item.itemId) ? "Approving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => openReject("review", item.itemId)}
                  disabled={isBusyOn("review", item.itemId)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </article>
          ))}

          {/* Pending Comments */}
          {commentItems.length > 0 && (
            <>
              <div className="pt-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MessageCircle className="h-4 w-4 text-slate-600" />
                  Pending comments ({commentItems.length})
                </h3>
              </div>
              {commentItems.map((item) => (
                <article
                  key={`comment-${item.itemId}`}
                  className="rounded-md border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                      <MessageCircle className="h-3.5 w-3.5" />
                      Pending comment
                    </span>
                    <span className="text-sm text-slate-600">
                      on <span className="font-semibold">{item.toolName}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-3">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5 text-slate-400" />
                      {item.authorName}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                      Submitted {formatSubmittedDate(item.submittedDate)}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    {item.text}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => handleApproveComment(item.itemId)}
                      disabled={isBusyOn("comment", item.itemId)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {isBusyOn("comment", item.itemId) ? "Approving..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openReject("comment", item.itemId)}
                      disabled={isBusyOn("comment", item.itemId)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </>
          )}
        </div>
      )}

      {/* Rejection modal */}
      {rejectingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form
            onSubmit={rejectionForm.handleSubmit(handleConfirmReject)}
            className="w-full max-w-lg rounded-md border border-slate-200 bg-white shadow-lg"
            noValidate
          >
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">
                Reject {rejectingTarget.kind === "review" ? "review" : "comment"}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                This reason is stored for the audit trail and shared with the
                customer on their My Reviews page.
              </p>
            </div>

            <div className="space-y-1.5 px-6 py-5">
              <Label htmlFor="rejection-reason" className="sr-only">
                Rejection reason
              </Label>
              <Textarea
                id="rejection-reason"
                rows={4}
                placeholder="Why is this being rejected?"
                aria-invalid={
                  rejectionForm.formState.errors.reason ? "true" : undefined
                }
                {...rejectionForm.register("reason")}
              />
              {rejectionForm.formState.errors.reason && (
                <p className="text-xs text-red-600">
                  {rejectionForm.formState.errors.reason.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeReject}
                disabled={rejectionForm.formState.isSubmitting}
                className="rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={
                  rejectionForm.formState.isSubmitting ||
                  (rejectingTarget
                    ? isBusyOn(rejectingTarget.kind, rejectingTarget.id)
                    : false)
                }
                className="rounded-md"
              >
                Confirm reject
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
