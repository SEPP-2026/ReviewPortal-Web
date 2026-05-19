"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  getFeaturedCategories,
  toCategorySlug,
  type BackendCategory,
} from "@/lib/backend-api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80";

export function Categories() {
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await getFeaturedCategories();
        if (!isMounted) return;
        setCategories(data);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load categories."
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
    <section className="py-24 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#111111] mb-6">
            Browse Equipment by Category
          </h2>
          <p className="text-[#666666] text-xl max-w-3xl mx-auto leading-relaxed">
            From construction machinery to precision tools, find everything you
            need for your project in our comprehensive catalogue.
          </p>
        </div>

        {isLoading ? (
          <Spinner size="md" text="Loading categories..." />
        ) : errorMessage ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {errorMessage}
          </div>
        ) : categories.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 text-center text-[#666666]">
            No categories available yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/equipment?category=${toCategorySlug(category.name)}`}
                className="group relative h-[420px] rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="absolute inset-0">
                  <img
                    src={category.imageUrl || FALLBACK_IMAGE}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/60 group-hover:via-black/20 group-hover:to-transparent transition-all duration-500"></div>

                <div className="relative h-full flex flex-col justify-end p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-accent text-black text-sm font-bold px-4 py-2 rounded-full">
                      {category.toolCount} {category.toolCount === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-accent transition-colors duration-300">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-white/90 text-base mb-6 leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-accent font-bold text-lg">
                    View Equipment
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
