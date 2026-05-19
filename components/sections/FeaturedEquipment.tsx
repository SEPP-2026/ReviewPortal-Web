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
    <section className="py-24 bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#111111] mb-4">
              Ready to Rent Today
            </h2>
            <p className="text-[#666666] text-xl max-w-xl leading-relaxed">
              Our most requested equipment, available now with same-day delivery.
            </p>
          </div>
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 text-accent font-bold text-lg hover:gap-4 transition-all mt-6 md:mt-0 group"
          >
            View All Equipment
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <Spinner size="md" text="Loading featured equipment..." />
        ) : errorMessage ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {errorMessage}
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 text-center text-[#666666]">
            No equipment available yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="group bg-white border-2 border-gray-200 rounded-3xl overflow-hidden hover:border-accent transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent text-black text-xs font-semibold px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {item.hasEnoughReviewsToRate ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-accent fill-accent" />
                          <span className="text-[#111111] font-bold text-base">
                            {item.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-[#999] text-sm">
                          ({item.reviewCount} reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-[#999] text-sm">
                        {item.ratingMessage || "No reviews yet"}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[#111111] mb-4 group-hover:text-accent transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                    {item.name}
                  </h3>

                  <div className="bg-[#F8F8F8] rounded-2xl p-4 mb-5">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-extrabold text-accent">
                        ${item.dailyRate.toFixed(2)}
                      </span>
                      <span className="text-[#999] text-sm font-medium">/day</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#666666]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>${item.hourlyRate}/hr</span>
                      </div>
                      <span className="text-[#999]">•</span>
                      <span>${item.weeklyRate}/wk</span>
                    </div>
                  </div>

                  <button className="w-full bg-accent hover:bg-[#C97F00] text-black font-bold py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                    Rent Now
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
