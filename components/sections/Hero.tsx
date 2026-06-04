"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Shield, Truck, Clock } from "lucide-react";
import { getFeaturedCategories, toCategorySlug } from "@/lib/api/categories";
import type { BackendCategory } from "@/types/backend";

const TRUST_ITEMS = [
  { icon: Shield, label: "Quality assured" },
  { icon: Truck, label: "Same-day delivery" },
  { icon: Clock, label: "Flexible hire periods" },
] as const;

export function Hero() {
  const router = useRouter();
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFeaturedCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    router.push(term ? `/equipment?q=${encodeURIComponent(term)}` : "/equipment");
  };

  return (
    <section className="relative bg-white pt-[var(--nav-offset)] overflow-hidden">
      {/* Subtle background split */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#F8F8F8] hidden lg:block" />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-0 items-stretch min-h-[calc(100vh-var(--nav-offset))]">

          {/* Left column */}
          <div className="flex flex-col justify-center py-16 lg:pr-16">
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-5">
              Professional Tool Hire
            </p>

            <h1 className="text-5xl md:text-6xl xl:text-[4.25rem] font-extrabold text-[#111111] leading-[1.06] tracking-tight mb-6">
              Rent Quality Tools,{" "}
              <span className="text-accent">Get the Job Done</span>
            </h1>

            <p className="text-[#666666] text-xl leading-relaxed max-w-[480px] mb-10">
              Professional-grade equipment for every project — construction,
              landscaping, plumbing and beyond. Flexible hourly, daily or weekly
              rates.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-md p-1 max-w-md mb-5"
            >
              <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search equipment…"
                className="flex-1 bg-transparent text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none py-2"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
              >
                Search
              </button>
            </form>

            {/* Dynamic category pills */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-10">
                {categories.slice(0, 5).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/equipment?category=${toCategorySlug(cat.name)}`}
                    className="text-xs text-slate-700 border border-slate-200 hover:border-slate-400 hover:text-slate-900 px-2.5 py-1 rounded-md transition-colors font-medium"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  href="/equipment"
                  className="text-xs text-accent font-medium flex items-center gap-1 px-2.5 py-1 hover:underline"
                >
                  All categories
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-[#666666] text-sm">
                  <Icon className="w-4 h-4 text-accent" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="hidden lg:flex items-center justify-center bg-[#F8F8F8] py-16 pl-12">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80"
              alt="Professional power tools ready for hire"
              className="w-full max-h-[70vh] object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
