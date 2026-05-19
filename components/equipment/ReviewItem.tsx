"use client";

import { useState } from "react";
import { Star, MessageCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  createReviewComment,
  createCompanyResponse,
  deleteCompanyResponse,
  updateCompanyResponse,
  type BackendReview,
  type BackendReviewComment,
  type BackendCompanyResponse,
} from "@/lib/backend-api";
import type { CurrentUser } from "@/hooks/use-current-user";

interface ReviewItemProps {
  review: BackendReview;
  currentUser: CurrentUser | null;
  isStaff: boolean;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function ReviewItem({ review, currentUser, isStaff }: ReviewItemProps) {
  const [comments, setComments] = useState<BackendReviewComment[]>(
    review.comments ?? []
  );
  const [companyResponse, setCompanyResponse] =
    useState<BackendCompanyResponse | null>(review.companyResponse ?? null);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commenterName, setCommenterName] = useState(currentUser?.name ?? "");
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [responseText, setResponseText] = useState(
    companyResponse?.responseText ?? ""
  );
  const [isSavingResponse, setIsSavingResponse] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);

  const handleAddComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCommentError(null);

    if (commentText.trim().length < 3 || commenterName.trim().length < 2) {
      setCommentError("Please provide your name and a comment (min 3 chars).");
      return;
    }

    setIsCommenting(true);
    try {
      const created = await createReviewComment(review.id, {
        commenterName: commenterName.trim(),
        commentText: commentText.trim(),
      });
      setComments((prev) => [...prev, created]);
      setCommentText("");
    } catch (error) {
      setCommentError(
        error instanceof Error ? error.message : "Failed to post comment."
      );
    } finally {
      setIsCommenting(false);
    }
  };

  const handleSaveResponse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseError(null);

    if (responseText.trim().length < 5) {
      setResponseError("Response must be at least 5 characters.");
      return;
    }

    setIsSavingResponse(true);
    try {
      const saved = companyResponse
        ? await updateCompanyResponse(review.id, {
            responseText: responseText.trim(),
          })
        : await createCompanyResponse(review.id, {
            responseText: responseText.trim(),
          });
      setCompanyResponse(saved);
      setShowResponseForm(false);
    } catch (error) {
      setResponseError(
        error instanceof Error ? error.message : "Failed to save response."
      );
    } finally {
      setIsSavingResponse(false);
    }
  };

  const handleDeleteResponse = async () => {
    if (!companyResponse) return;
    if (!confirm("Delete this company response?")) return;

    setIsSavingResponse(true);
    setResponseError(null);
    try {
      await deleteCompanyResponse(review.id);
      setCompanyResponse(null);
      setResponseText("");
    } catch (error) {
      setResponseError(
        error instanceof Error ? error.message : "Failed to delete response."
      );
    } finally {
      setIsSavingResponse(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-[#111111]">{review.reviewerName}</p>
          <p className="text-xs text-[#666666] mt-0.5">
            {formatDate(review.createdDate)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < Math.round(review.overallRating)
                    ? "text-accent fill-accent"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-[#111111]">
            {review.overallRating.toFixed(1)}
          </span>
        </div>
      </div>

      <p className="text-[#444444] leading-relaxed mb-4">{review.reviewText}</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4 p-3 bg-[#F8F8F8] rounded-xl">
        {(
          [
            { label: "Equipment", value: review.equipmentRating },
            { label: "Service", value: review.customerServiceRating },
            { label: "Tech Support", value: review.technicalSupportRating },
            { label: "After Sales", value: review.afterSalesRating },
            { label: "Value", value: review.valueForMoneyRating },
          ] as { label: string; value: number }[]
        ).map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-xs text-[#666666] mb-1">{label}</p>
            <div className="flex items-center justify-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < value ? "text-accent fill-accent" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-[#111111] mt-0.5">{value}/5</p>
          </div>
        ))}
      </div>

      {companyResponse && (
        <div className="border-l-4 border-accent bg-accent/5 rounded-r-xl p-4 mt-4">
          <p className="text-xs font-semibold text-accent mb-1">
            Response from {companyResponse.staffName}
          </p>
          <p className="text-sm text-[#444444] leading-relaxed">
            {companyResponse.responseText}
          </p>
          <p className="text-xs text-[#666666] mt-2">
            {formatDate(companyResponse.createdDate)}
          </p>
          {isStaff && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setResponseText(companyResponse.responseText);
                  setShowResponseForm(true);
                }}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Edit response
              </button>
              <button
                type="button"
                onClick={handleDeleteResponse}
                disabled={isSavingResponse}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {isStaff && (!companyResponse || showResponseForm) && (
        <form
          onSubmit={handleSaveResponse}
          className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            {companyResponse ? "Edit response" : "Add a company response"}
          </p>
          {responseError && (
            <p className="text-xs text-red-700">{responseError}</p>
          )}
          <textarea
            value={responseText}
            onChange={(event) => setResponseText(event.target.value)}
            rows={3}
            placeholder="Reply on behalf of Shelton Tool-Hire..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSavingResponse}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-[#C97F00] disabled:opacity-60"
            >
              {isSavingResponse
                ? "Saving..."
                : companyResponse
                ? "Update response"
                : "Post response"}
            </button>
            {companyResponse && (
              <button
                type="button"
                onClick={() => {
                  setShowResponseForm(false);
                  setResponseText(companyResponse.responseText);
                }}
                className="text-sm font-semibold text-[#666666] hover:text-[#111111]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mt-4 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => setShowComments((prev) => !prev)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#666666] hover:text-accent"
        >
          <MessageCircle className="h-4 w-4" />
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
          {showComments ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showComments && (
          <div className="mt-3 space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-[#666666]">No approved comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-gray-100 bg-[#FBFBFB] p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#111111]">
                      {comment.commenterName}
                    </p>
                    <p className="text-xs text-[#666666]">
                      {formatDate(comment.createdDate)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-[#444444]">
                    {comment.commentText}
                  </p>
                  {comment.status.toLowerCase() !== "approved" && (
                    <p className="mt-1 text-xs italic text-amber-700">
                      Awaiting moderation
                    </p>
                  )}
                </div>
              ))
            )}

            <form onSubmit={handleAddComment} className="space-y-2">
              {commentError && (
                <p className="text-xs text-red-700">{commentError}</p>
              )}
              <div className="grid sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={commenterName}
                  onChange={(event) => setCommenterName(event.target.value)}
                  required
                  placeholder="Your name"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={2}
                required
                placeholder="Add a public comment..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={isCommenting}
                className="rounded-lg bg-[#111111] px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                {isCommenting ? "Posting..." : "Post comment"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
