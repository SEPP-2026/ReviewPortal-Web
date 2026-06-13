"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Star, ThumbsUp, MessageCircle, Filter } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  getCategories,
  getToolReviews,
  getToolsByCategory,
  type BackendToolSummary,
} from "@/lib/backend-api";

interface ReviewCard {
  id: string;
  author: string;
  role: string;
  date: string;
  createdAt: string;
  rating: number;
  category: string;
  equipment?: string;
  title: string;
  text: string;
  helpful: number;
  replies: number;
}

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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Reviews");
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const categories = await getCategories();

        const toolPages = await Promise.all(
          categories.map((category) =>
            getToolsByCategory(category.id, {
              page: 1,
              pageSize: 8,
              sortBy: "rating_desc",
            })
          )
        );

        const uniqueTools = Array.from(
          new Map(
            toolPages
              .flatMap((page) => page.items)
              .map((tool) => [tool.id, tool])
          ).values()
        ) as BackendToolSummary[];

        const topTools = uniqueTools.slice(0, 12);

        const reviewsByTool = await Promise.all(
          topTools.map(async (tool) => {
            const data = await getToolReviews(tool.id, { page: 1, pageSize: 4 });
            return {
              tool,
              reviews: data.reviews.items,
            };
          })
        );

        const cards = reviewsByTool
          .flatMap(({ tool, reviews: toolReviews }) =>
            toolReviews.map((review) => ({
              id: `${tool.id}-${review.id}`,
              author: review.reviewerName,
              role: "Verified Customer",
              date: toRelativeDate(review.createdDate),
              createdAt: review.createdDate,
              rating: review.overallRating,
              category: tool.categoryName,
              equipment: review.toolName,
              title: toReviewTitle(review.reviewText),
              text: review.reviewText,
              helpful: review.helpfulCount,
              replies: review.comments.length + (review.companyResponse ? 1 : 0),
            }))
          )
          // Backend returns newest-first per tool; after merging across tools
          // re-sort by date so the 60-item cap keeps the most recent reviews.
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 60);

        if (!isMounted) return;
        setReviews(cards);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load reviews.");
        setReviews([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => [
      "All Reviews",
      ...Array.from(new Set(reviews.map((review) => review.category))).sort(),
    ],
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    const matching = reviews.filter((review) =>
      selectedCategory === "All Reviews"
        ? true
        : review.category === selectedCategory
    );

    const byRecent = (a: ReviewCard, b: ReviewCard) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    // Copy first so we never mutate the source `reviews` array in place.
    return [...matching].sort((a, b) => {
      if (sortBy === "helpful") {
        // `helpful` is the backend-computed HelpfulCount; fall back to recency
        // on ties for a stable order.
        return b.helpful - a.helpful || byRecent(a, b);
      }
      return byRecent(a, b);
    });
  }, [reviews, selectedCategory, sortBy]);

  const averageRating = useMemo(() => {
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
                  {averageRating.toFixed(1)}
                </span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Average rating
              </p>
            </div>
            <div>
              <span className="text-3xl font-semibold tracking-tight text-slate-900">
                {reviews.length}
              </span>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Total reviews
              </p>
              <p className="text-xs text-slate-500">Approved submissions</p>
            </div>
            <div>
              <span className="text-3xl font-semibold tracking-tight text-slate-900">
                {reviews.length > 0 ? "100%" : "0%"}
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
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "helpful")}
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
            {filteredReviews.map((review) => (
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
                  <div className="flex items-center gap-2">
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
                    <span className="text-xs text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                      {review.category}
                    </span>
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
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-accent transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="text-xs">Helpful ({review.helpful})</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-accent transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="text-xs">Replies ({review.replies})</span>
                  </button>
                </div>
              </div>
            ))}

            {!error && filteredReviews.length === 0 && (
              <div className="text-center py-12 text-sm text-slate-500 rounded-md border border-dashed border-slate-300 bg-white">
                No reviews found for this filter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
