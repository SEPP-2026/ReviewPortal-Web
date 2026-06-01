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
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Catalogue
          </p>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Browse equipment by category
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            From construction machinery to precision tools, find everything you
            need for your project.
          </p>
        </div>

        {isLoading ? (
          <Spinner size="md" text="Loading categories..." />
        ) : errorMessage ? (
          <div className="mx-auto max-w-xl rounded-md border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {errorMessage}
          </div>
        ) : categories.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            No categories available yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/equipment?category=${toCategorySlug(category.name)}`}
                className="group bg-white border border-slate-200 rounded-md overflow-hidden hover:border-slate-400 transition-colors"
              >
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={category.imageUrl || FALLBACK_IMAGE}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-white/95 border border-slate-200 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-md">
                    {category.toolCount}{" "}
                    {category.toolCount === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-1 text-sm font-medium text-accent">
                    View equipment
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
