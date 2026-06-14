"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Star, ThumbsUp, MessageCircle, Filter, Send } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  getAllReviews,
  createReviewComment,
  type BackendReview,
} from "@/lib/backend-api";

interface ReplyItem {
  id: string;
  author: string;
  text: string;
  date: string;
  isStaff?: boolean;
}

interface ReviewCard {
  id: string;
  reviewId: number;
  author: string;
  role: string;
  date: string;
  createdAt: string;
  rating: number;
  equipment?: string;
  title: string;
  text: string;
  helpful: number;
  replies: number;
  repliesList: ReplyItem[];
}

// Reviews are now served page-by-page from GET /api/reviews.
const PAGE_SIZE = 8;

// The backend has no "helpful vote" endpoint (HelpfulCount is server-computed),
// so a reader's own "found this helpful" mark is persisted per-browser.
const HELPFUL_STORAGE_KEY = "rp_helpful_votes";

const AVATAR_PALETTES = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const avatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const toReviewTitle = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return "Customer feedback";

  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim() || trimmed;
  if (firstSentence.length > 70) {
    return `${firstSentence.slice(0, 67)}...`;
  }

  return firstSentence;
};

const toRelativeDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Recently";

  return formatDistanceToNow(date, { addSuffix: true });
};

const buildCard = (review: BackendReview): ReviewCard => {
  const repliesList: ReplyItem[] = [
    // Staff/company response shown first when present.
    ...(review.companyResponse
      ? [
          {
            id: `resp-${review.id}`,
            author: `${review.companyResponse.staffName} · Shelton Tool-Hire`,
            text: review.companyResponse.responseText,
            date: toRelativeDate(review.companyResponse.createdDate),
            isStaff: true,
          },
        ]
      : []),
    ...review.comments.map((comment) => ({
      id: `cmt-${comment.id}`,
      author: comment.commenterName,
      text: comment.commentText,
      date: toRelativeDate(comment.createdDate),
    })),
  ];

  return {
    id: String(review.id),
    reviewId: review.id,
    author: review.reviewerName,
    role: "Verified Customer",
    date: toRelativeDate(review.createdDate),
    createdAt: review.createdDate,
    rating: review.overallRating,
    equipment: review.toolName,
    title: toReviewTitle(review.reviewText),
    text: review.reviewText,
    helpful: review.helpfulCount,
    replies: repliesList.length,
    repliesList,
  };
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewCard[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const { user: currentUser, isStaff } = useCurrentUser();

  // Load the reader's own "helpful" marks (client-only; no backend vote API).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HELPFUL_STORAGE_KEY);
      if (raw) setHelpfulVotes(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      // ignore malformed/unavailable storage
    }
  }, []);

  // Server-side pagination + sort: refetch whenever the page or sort changes.
  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllReviews({ page, pageSize: PAGE_SIZE, sortBy });
        if (!isMounted) return;
        setReviews(data.items.map(buildCard));
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (loadError) {
        if (!isMounted) return;
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load reviews.",
        );
        setReviews([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [page, sortBy]);

  const toggleHelpful = (id: string) => {
    setHelpfulVotes((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      try {
        window.localStorage.setItem(HELPFUL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage write failures (e.g. private browsing)
      }
      return next;
    });
  };

  const toggleReplies = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Staff (Admin/Moderator) can reply directly from the reviews list. Their
  // comment is auto-approved server-side, so it appears immediately.
  const handlePostReply = async (card: ReviewCard) => {
    const text = (replyDrafts[card.id] ?? "").trim();
    if (text.length < 10) {
      toast.error("Reply must be at least 10 characters");
      return;
    }

    setSubmittingReplyId(card.id);
    try {
      const created = await createReviewComment(card.reviewId, {
        commenterName: currentUser?.name ?? "Staff",
        commentText: text,
      });
      const newReply: ReplyItem = {
        id: `cmt-${created.id}`,
        author: created.commenterName,
        text: created.commentText,
        date: toRelativeDate(created.createdDate),
        isStaff: true,
      };
      setReviews((prev) =>
        prev.map((r) =>
          r.id === card.id
            ? {
                ...r,
                repliesList: [...r.repliesList, newReply],
                replies: r.replies + 1,
              }
            : r,
        ),
      );
      setReplyDrafts((prev) => ({ ...prev, [card.id]: "" }));
      setExpandedIds((prev) => new Set(prev).add(card.id));
      toast.success("Reply posted");
    } catch (postError) {
      toast.error("Could not post reply", {
        description:
          postError instanceof Error ? postError.message : "Please try again.",
      });
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleSortChange = (value: "recent" | "helpful") => {
    setSortBy(value);
    setPage(1);
  };

  // Average across the current page (the API has no site-wide aggregate).
  const pageAverageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  }, [reviews]);

  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Customer feedback
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Reviews & ratings
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-xl">
            Real feedback collected from approved tool reviews.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-semibold tracking-tight text-slate-900">
                  {pageAverageRating.toFixed(1)}
                </span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Average (this page)
              </p>
            </div>
            <div>
              <span className="text-3xl font-semibold tracking-tight text-slate-900">
                {totalCount}
              </span>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Total reviews
              </p>
              <p className="text-xs text-slate-500">Approved submissions</p>
            </div>
            <div>
              <span className="text-3xl font-semibold tracking-tight text-slate-900">
                {totalCount > 0 ? "100%" : "0%"}
              </span>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Verified content
              </p>
              <p className="text-xs text-slate-500">Moderated by our team</p>
            </div>
            <div>
              <span className="text-3xl font-semibold tracking-tight text-slate-900">
                Live
              </span>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                API connected
              </p>
              <p className="text-xs text-slate-500">Data synced from backend</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <p className="text-sm text-slate-600">
            Showing approved reviews across all equipment.
          </p>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value as "recent" | "helpful")
              }
              className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="recent">Most recent</option>
              <option value="helpful">Most helpful</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-16">
            <Spinner size="md" text="Loading reviews..." />
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-slate-200 rounded-md p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(review.author)}`}
                    >
                      {getInitials(review.author)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {review.author}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {review.role} · {review.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(review.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.equipment && (
                  <div className="mb-2">
                    <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      Equipment: {review.equipment}
                    </span>
                  </div>
                )}

                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  {review.title}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  {review.text}
                </p>

                <div className="flex items-center gap-5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleHelpful(review.id)}
                    aria-pressed={Boolean(helpfulVotes[review.id])}
                    className={`flex items-center gap-1.5 transition-colors ${
                      helpfulVotes[review.id]
                        ? "text-accent"
                        : "text-slate-500 hover:text-accent"
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${
                        helpfulVotes[review.id] ? "fill-accent" : ""
                      }`}
                    />
                    <span className="text-xs">
                      Helpful ({review.helpful + (helpfulVotes[review.id] ? 1 : 0)})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      (review.replies > 0 || isStaff) && toggleReplies(review.id)
                    }
                    aria-expanded={expandedIds.has(review.id)}
                    disabled={review.replies === 0 && !isStaff}
                    className={`flex items-center gap-1.5 transition-colors ${
                      review.replies === 0 && !isStaff
                        ? "cursor-not-allowed text-slate-300"
                        : expandedIds.has(review.id)
                          ? "text-accent"
                          : "text-slate-500 hover:text-accent"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="text-xs">Replies ({review.replies})</span>
                  </button>
                </div>

                {expandedIds.has(review.id) &&
                  (review.repliesList.length > 0 || isStaff) && (
                    <div className="mt-3 space-y-2">
                      {review.repliesList.map((reply) => (
                        <div
                          key={reply.id}
                          className={`rounded-md p-3 ${
                            reply.isStaff
                              ? "border border-amber-100 bg-amber-50"
                              : "border border-slate-100 bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                              {reply.author}
                              {reply.isStaff && (
                                <span className="rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700">
                                  Staff
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-xs text-slate-400">
                              {reply.date}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                            {reply.text}
                          </p>
                        </div>
                      ))}

                      {/* Staff reply box — comment is auto-approved server-side. */}
                      {isStaff && (
                        <div className="rounded-md border border-slate-200 bg-white p-3">
                          <label
                            htmlFor={`reply-${review.id}`}
                            className="mb-1.5 block text-xs font-medium text-slate-600"
                          >
                            Reply as staff
                          </label>
                          <textarea
                            id={`reply-${review.id}`}
                            rows={2}
                            value={replyDrafts[review.id] ?? ""}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({
                                ...prev,
                                [review.id]: e.target.value,
                              }))
                            }
                            placeholder="Write a reply (at least 10 characters)…"
                            className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handlePostReply(review)}
                              disabled={submittingReplyId === review.id}
                              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Send className="h-3.5 w-3.5" />
                              {submittingReplyId === review.id
                                ? "Posting…"
                                : "Post reply"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))}

            {!error && reviews.length === 0 && (
              <div className="text-center py-12 text-sm text-slate-500 rounded-md border border-dashed border-slate-300 bg-white">
                No reviews yet.
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
              isLoading={isLoading}
              className="mt-6"
            />
          </div>
        )}
      </div>
    </div>
  );
}
