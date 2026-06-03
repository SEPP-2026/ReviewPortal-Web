"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { getToolsByCategory } from "@/lib/api/categories";
import { getToolReviews } from "@/lib/api/reviews";
import type { BackendReview } from "@/types/backend";

interface DisplayReview {
  id: string;
  name: string;
  toolName: string;
  text: string;
  rating: number;
  date: string;
}

const AVATAR_PALETTES = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const [reviews, setReviews] = useState<DisplayReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const cats = await getCategories();
        if (!active || cats.length === 0) return;

        const toolPages = await Promise.allSettled(
          cats.slice(0, 4).map((c) =>
            getToolsByCategory(c.id, { page: 1, pageSize: 3, sortBy: "rating_desc" })
          )
        );

        const toolIds = toolPages
          .flatMap((r) => (r.status === "fulfilled" ? r.value.items.map((t) => t.id) : []))
          .slice(0, 8);

        if (!active || toolIds.length === 0) return;

        const reviewPages = await Promise.allSettled(
          toolIds.map((id) => getToolReviews(id, { page: 1, pageSize: 2 }))
        );

        const mapped: DisplayReview[] = reviewPages
          .flatMap((r) =>
            r.status === "fulfilled"
              ? r.value.reviews.items
                  .filter(
                    (rv: BackendReview) =>
                      rv.status === "Approved" && rv.reviewText.trim().length > 40
                  )
                  .map((rv: BackendReview) => ({
                    id: String(rv.id),
                    name: rv.reviewerName,
                    toolName: rv.toolName,
                    text: rv.reviewText,
                    rating: rv.overallRating,
                    date: formatDate(rv.createdDate),
                  }))
              : []
          )
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        if (active) setReviews(mapped);
      } catch {
        // Non-critical — component stays empty
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) return null;
  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Customer reviews
          </p>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            What customers say
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-slate-200 rounded-md p-5 flex flex-col gap-3"
            >
              <Stars rating={Math.round(review.rating)} />

              <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                &ldquo;{review.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100">
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(review.name)}`}
                >
                  {initials(review.name)}
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">
                    {review.name}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {review.toolName}
                    {review.date ? ` · ${review.date}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
