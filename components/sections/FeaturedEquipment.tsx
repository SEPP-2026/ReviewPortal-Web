"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Clock, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  getCategories,
  getToolsByCategory,
  type BackendToolSummary,
} from "@/lib/backend-api";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80";

interface FeaturedItem {
  id: number;
  name: string;
  category: string;
  image: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  rating: number;
  reviewCount: number;
  hasEnoughReviewsToRate: boolean;
  ratingMessage: string | null;
}

const toFeaturedItem = (tool: BackendToolSummary): FeaturedItem => {
  const hourly =
    tool.startingPriceUnit.toLowerCase().includes("hour")
      ? tool.startingPrice
      : Math.max(1, Math.round(tool.dailyRate / 8));

  return {
    id: tool.id,
    name: tool.name,
    category: tool.categoryName,
    image: tool.thumbnailUrl || DEFAULT_IMAGE,
    hourlyRate: hourly,
    dailyRate: tool.dailyRate,
    weeklyRate: Math.max(tool.dailyRate * 5, tool.dailyRate),
    rating: tool.overallRating ?? 0,
    reviewCount: tool.reviewCount,
    hasEnoughReviewsToRate: tool.hasEnoughReviewsToRate,
    ratingMessage: tool.ratingMessage,
  };
};

export function FeaturedEquipment() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const categories = await getCategories();
        if (categories.length === 0) {
          if (isMounted) setItems([]);
          return;
        }

        const pages = await Promise.all(
          categories.slice(0, 6).map((category) =>
            getToolsByCategory(category.id, {
              page: 1,
              pageSize: 4,
              sortBy: "rating_desc",
            })
          )
        );

        const unique = Array.from(
          new Map(
            pages
              .flatMap((page) => page.items)
              .map((tool) => [tool.id, tool])
          ).values()
        );

        const sorted = unique
          .sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0))
          .slice(0, 6)
          .map(toFeaturedItem);

        if (!isMounted) return;
        setItems(sorted);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load featured equipment."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Featured
            </p>
            <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              Ready to rent today
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 max-w-xl">
              Our most requested equipment, available now with same-day delivery.
            </p>
          </div>
          <Link
            href="/equipment"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline mt-4 md:mt-0"
          >
            View all equipment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <Spinner size="md" text="Loading featured equipment..." />
        ) : errorMessage ? (
          <div className="mx-auto max-w-xl rounded-md border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {errorMessage}
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            No equipment available yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="group bg-white border border-slate-200 rounded-md overflow-hidden hover:border-slate-400 transition-colors"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-white/95 border border-slate-200 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {item.hasEnoughReviewsToRate ? (
                      <>
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-slate-900 font-semibold text-sm">
                          {item.rating.toFixed(1)}
                        </span>
                        <span className="text-slate-500 text-xs">
                          ({item.reviewCount} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500 text-xs">
                        {item.ratingMessage || "No reviews yet"}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 mb-3 group-hover:text-accent transition-colors line-clamp-2 min-h-[3rem]">
                    {item.name}
                  </h3>

                  <div className="border-t border-slate-100 pt-3 mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold text-slate-900">
                        ${item.dailyRate.toFixed(2)}
                      </span>
                      <span className="text-slate-500 text-xs">/day</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />${item.hourlyRate}/hr
                      </span>
                      <span>·</span>
                      <span>${item.weeklyRate}/wk</span>
                    </div>
                  </div>

                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-md transition-colors text-sm">
                    Rent now
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
