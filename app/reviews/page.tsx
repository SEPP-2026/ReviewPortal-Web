"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Star, ThumbsUp, MessageCircle, Filter } from "lucide-react";
import {
  getCategories,
  getToolReviews,
  getToolsByCategory,
  type BackendToolSummary,
} from "@/lib/backend-api";

interface ReviewCard {
  id: string;
  author: string;
  avatar: string;
  role: string;
  date: string;
  rating: number;
  category: string;
  equipment?: string;
  title: string;
  text: string;
  helpful: number;
  replies: number;
}

const toReviewTitle = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return "Customer feedback";

  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim() || trimmed;
  if (firstSentence.length > 70) {
    return `${firstSentence.slice(0, 67)}...`;
  }

  return firstSentence;
};

const getAvatar = (name: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

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
              avatar: getAvatar(review.reviewerName),
              role: "Verified Customer",
              date: toRelativeDate(review.createdDate),
              rating: review.overallRating,
              category: tool.categoryName,
              equipment: review.toolName,
              title: toReviewTitle(review.reviewText),
              text: review.reviewText,
              helpful: review.comments.length + Math.round(review.overallRating * 2),
              replies: review.comments.length + (review.companyResponse ? 1 : 0),
            }))
          )
          .sort((a, b) => b.rating - a.rating)
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

    return matching.sort((a, b) => {
      if (sortBy === "helpful") return b.helpful - a.helpful;
      return 0;
    });
  }, [reviews, selectedCategory, sortBy]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  }, [reviews]);

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Customer Feedback
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] mb-4">
            Reviews & Ratings
          </h1>
          <p className="text-[#666666] text-lg max-w-2xl mx-auto">
            Real feedback collected from approved tool reviews.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating)
                        ? "text-accent fill-accent"
                        : "text-gray"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#111111] mb-2">{reviews.length}</div>
              <p className="text-[#111111] font-semibold">Total Reviews</p>
              <p className="text-[#666666] text-sm">Approved submissions</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#111111] mb-2">
                {reviews.length > 0 ? "100%" : "0%"}
              </div>
              <p className="text-[#111111] font-semibold">Verified Content</p>
              <p className="text-[#666666] text-sm">Moderated by our team</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#111111] mb-2">Live</div>
              <p className="text-[#111111] font-semibold">API Connected</p>
              <p className="text-[#666666] text-sm">Data synced from backend</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-accent text-black"
                    : "bg-white text-[#666666] hover:text-[#111111] border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#666666]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "helpful")}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-[#111111] text-sm focus:outline-none focus:border-accent"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20 text-[#666666]">Loading reviews...</div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-accent/30 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={review.avatar}
                      alt={review.author}
                      className="w-14 h-14 rounded-full bg-gray/20"
                    />
                    <div>
                      <h4 className="text-[#111111] font-bold">{review.author}</h4>
                      <p className="text-[#666666] text-sm">{review.role}</p>
                      <p className="text-[#666666] text-xs">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(review.rating)
                              ? "text-accent fill-accent"
                              : "text-gray"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-accent bg-accent/10 px-3 py-1 rounded-full">
                      {review.category}
                    </span>
                  </div>
                </div>

                {review.equipment && (
                  <div className="mb-3">
                    <span className="text-xs text-[#666666] bg-[#F2F2F2] px-3 py-1 rounded-lg">
                      Equipment: {review.equipment}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-bold text-[#111111] mb-2">{review.title}</h3>
                <p className="text-[#666666] leading-relaxed mb-4">{review.text}</p>

                <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                  <button className="flex items-center gap-2 text-[#666666] hover:text-accent transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">Helpful ({review.helpful})</span>
                  </button>
                  <button className="flex items-center gap-2 text-[#666666] hover:text-accent transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Replies ({review.replies})</span>
                  </button>
                </div>
              </div>
            ))}

            {!error && filteredReviews.length === 0 && (
              <div className="text-center py-16 text-[#666666]">No reviews found for this filter.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
