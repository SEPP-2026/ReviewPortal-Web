"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Star,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createReviewComment,
  createCompanyResponse,
  deleteCompanyResponse,
  updateCompanyResponse,
  type BackendReview,
  type BackendReviewComment,
  type BackendCompanyResponse,
} from "@/lib/backend-api";
import {
  commentSchema,
  companyResponseSchema,
  type CommentValues,
  type CompanyResponseValues,
} from "@/lib/form-schemas";
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
    review.comments ?? [],
  );
  const [companyResponse, setCompanyResponse] =
    useState<BackendCompanyResponse | null>(review.companyResponse ?? null);
  const [showComments, setShowComments] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [isDeletingResponse, setIsDeletingResponse] = useState(false);

  const commentForm = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      commenterName: currentUser?.name ?? "",
      commentText: "",
    },
  });

  // Keep the commenter name in sync with the current user once auth resolves.
  useEffect(() => {
    commentForm.setValue("commenterName", currentUser?.name ?? "");
  }, [currentUser, commentForm]);

  const responseForm = useForm<CompanyResponseValues>({
    resolver: zodResolver(companyResponseSchema),
    defaultValues: {
      responseText: companyResponse?.responseText ?? "",
    },
  });

  const handleAddComment = async (values: CommentValues) => {
    try {
      const created = await createReviewComment(review.id, {
        commenterName: values.commenterName.trim(),
        commentText: values.commentText.trim(),
      });
      setComments((prev) => [...prev, created]);
      commentForm.reset({
        commenterName: currentUser?.name ?? values.commenterName,
        commentText: "",
      });
      toast.success("Comment submitted", {
        description: "It will appear after a moderator approves it.",
      });
    } catch (error) {
      toast.error("Could not post comment", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleSaveResponse = async (values: CompanyResponseValues) => {
    try {
      const saved = companyResponse
        ? await updateCompanyResponse(review.id, {
            responseText: values.responseText.trim(),
          })
        : await createCompanyResponse(review.id, {
            responseText: values.responseText.trim(),
          });
      setCompanyResponse(saved);
      setShowResponseForm(false);
      toast.success(
        companyResponse ? "Response updated" : "Response posted",
      );
    } catch (error) {
      toast.error("Could not save response", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleDeleteResponse = async () => {
    if (!companyResponse) return;
    if (!window.confirm("Delete this company response?")) return;

    setIsDeletingResponse(true);
    try {
      await deleteCompanyResponse(review.id);
      setCompanyResponse(null);
      responseForm.reset({ responseText: "" });
      toast.success("Response deleted");
    } catch (error) {
      toast.error("Could not delete response", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsDeletingResponse(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{review.reviewerName}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatDate(review.createdDate)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`w-3.5 h-3.5 ${
                  index < Math.round(review.overallRating)
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
      </div>

      <p className="text-sm text-slate-700 leading-relaxed mb-4">
        {review.reviewText}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3 p-3 border border-slate-200 bg-slate-50 rounded-md">
        {(
          [
            { label: "Equipment", value: review.equipmentRating },
            { label: "Service", value: review.customerServiceRating },
            { label: "Tech support", value: review.technicalSupportRating },
            { label: "After sales", value: review.afterSalesRating },
            { label: "Value", value: review.valueForMoneyRating },
          ] as { label: string; value: number }[]
        ).map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1">
              {label}
            </p>
            <div className="flex items-center justify-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < value ? "text-amber-400 fill-amber-400" : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-slate-900 mt-0.5">
              {value}/5
            </p>
          </div>
        ))}
      </div>

      {companyResponse && (
        <div className="border-l-2 border-accent bg-slate-50 rounded-r-md p-3 mt-3">
          <p className="text-xs font-semibold text-slate-900 mb-1">
            Response from {companyResponse.staffName}
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {companyResponse.responseText}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {formatDate(companyResponse.createdDate)}
          </p>
          {isStaff && (
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  responseForm.reset({
                    responseText: companyResponse.responseText,
                  });
                  setShowResponseForm(true);
                }}
                className="text-xs font-medium text-accent hover:underline"
              >
                Edit response
              </button>
              <button
                type="button"
                onClick={handleDeleteResponse}
                disabled={isDeletingResponse}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
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
          onSubmit={responseForm.handleSubmit(handleSaveResponse)}
          className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2.5"
          noValidate
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {companyResponse ? "Edit response" : "Add a company response"}
          </p>
          <div className="space-y-1.5">
            <Label htmlFor={`response-${review.id}`} className="sr-only">
              Response text
            </Label>
            <Textarea
              id={`response-${review.id}`}
              rows={3}
              placeholder="Reply on behalf of Shelton Tool-Hire..."
              aria-invalid={
                responseForm.formState.errors.responseText ? "true" : undefined
              }
              {...responseForm.register("responseText")}
            />
            {responseForm.formState.errors.responseText && (
              <p className="text-xs text-red-600">
                {responseForm.formState.errors.responseText.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={responseForm.formState.isSubmitting}
            >
              {responseForm.formState.isSubmitting
                ? "Saving..."
                : companyResponse
                  ? "Update response"
                  : "Post response"}
            </Button>
            {companyResponse && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowResponseForm(false);
                  responseForm.reset({
                    responseText: companyResponse.responseText,
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setShowComments((prev) => !prev)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-accent"
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
          <div className="mt-3 space-y-2.5">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-600">No approved comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-md border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {comment.commenterName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(comment.createdDate)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">
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

            <form
              onSubmit={commentForm.handleSubmit(handleAddComment)}
              className="space-y-2"
              noValidate
            >
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label
                    htmlFor={`comment-name-${review.id}`}
                    className="sr-only"
                  >
                    Your name
                  </Label>
                  <Input
                    id={`comment-name-${review.id}`}
                    placeholder="Your name"
                    aria-invalid={
                      commentForm.formState.errors.commenterName
                        ? "true"
                        : undefined
                    }
                    {...commentForm.register("commenterName")}
                  />
                  {commentForm.formState.errors.commenterName && (
                    <p className="text-xs text-red-600">
                      {commentForm.formState.errors.commenterName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`comment-text-${review.id}`} className="sr-only">
                  Comment
                </Label>
                <Textarea
                  id={`comment-text-${review.id}`}
                  rows={2}
                  placeholder="Add a public comment (at least 10 characters)..."
                  aria-invalid={
                    commentForm.formState.errors.commentText
                      ? "true"
                      : undefined
                  }
                  {...commentForm.register("commentText")}
                />
                {commentForm.formState.errors.commentText && (
                  <p className="text-xs text-red-600">
                    {commentForm.formState.errors.commentText.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={commentForm.formState.isSubmitting}
              >
                {commentForm.formState.isSubmitting
                  ? "Posting..."
                  : "Post comment"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
