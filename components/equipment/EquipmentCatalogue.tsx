"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Star,
  Clock,
  ChevronDown,
  Grid3X3,
  List,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import {
  type BackendToolSummary,
  getCategories,
  getToolsByCategory,
  searchTools,
  toCategorySlug,
} from "@/lib/backend-api";

type SortOption = "featured" | "price-low" | "price-high" | "rating" | "name";
type ViewMode = "grid" | "list";

interface CategoryFilter {
  id: number;
  name: string;
  slug: string;
}

interface CatalogueItem {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  image: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  rating: number;
  reviewCount: number;
  hasEnoughReviewsToRate: boolean;
  ratingMessage: string | null;
  available: boolean;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1581147036324-c1c2f6cd4cb2?w=900&q=80";

const mapSortToApi = (sortBy: SortOption) => {
  switch (sortBy) {
    case "price-low":
      return "price";
    case "price-high":
      return "price_desc";
    case "rating":
      return "rating_desc";
    case "name":
      return "name";
    default:
      return "rating_desc";
  }
};

const toCatalogueItem = (tool: BackendToolSummary): CatalogueItem => {
  const hourlyEstimate =
    tool.startingPriceUnit.toLowerCase().includes("hour")
      ? tool.startingPrice
      : Math.max(1, Math.round(tool.dailyRate / 8));

  const weeklyEstimate = Math.max(tool.dailyRate, Math.round(tool.dailyRate * 5));

  return {
    id: String(tool.id),
    name: tool.name,
    category: tool.categoryName,
    categorySlug: toCategorySlug(tool.categoryName),
    description: `${tool.categoryName} equipment available for hire.`,
    image: tool.thumbnailUrl || DEFAULT_IMAGE,
    hourlyRate: hourlyEstimate,
    dailyRate: tool.dailyRate,
    weeklyRate: weeklyEstimate,
    rating: tool.overallRating ?? 0,
    reviewCount: tool.reviewCount,
    hasEnoughReviewsToRate: tool.hasEnoughReviewsToRate,
    ratingMessage: tool.ratingMessage,
    available: true,
  };
};

const sortItems = (items: CatalogueItem[], sortBy: SortOption) => {
  const sorted = [...items];

  switch (sortBy) {
    case "price-low":
      sorted.sort((a, b) => a.dailyRate - b.dailyRate);
      break;
    case "price-high":
      sorted.sort((a, b) => b.dailyRate - a.dailyRate);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      sorted.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
      break;
  }

  return sorted;
};

export function EquipmentCatalogue() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 200);

  useEffect(() => {
    if (searchExpanded) {
      searchInputRef.current?.focus();
    }
  }, [searchExpanded]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await getCategories();
        if (!isMounted) return;

        const mapped = response.map((category) => ({
          id: category.id,
          name: category.name,
          slug: toCategorySlug(category.name),
        }));

        setCategories(mapped);

        const categoryExists =
          initialCategory === "all" ||
          mapped.some((category) => category.slug === initialCategory);

        if (!categoryExists) {
          setSelectedCategory("all");
        }
      } catch (categoryError) {
        if (!isMounted) return;
        setError(
          categoryError instanceof Error
            ? categoryError.message
            : "Failed to load categories."
        );
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [initialCategory]);

  useEffect(() => {
    let isMounted = true;

    const loadTools = async () => {
      if (categories.length === 0 && selectedCategory !== "all") {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const query = debouncedSearch.trim();
        let tools: BackendToolSummary[] = [];

        if (query.length > 0) {
          const searchResult = await searchTools(query, { page: 1, pageSize: 50 });
          tools = searchResult.items;

          if (selectedCategory !== "all") {
            tools = tools.filter(
              (tool) => toCategorySlug(tool.categoryName) === selectedCategory
            );
          }
        } else if (selectedCategory === "all") {
          const categoryResults = await Promise.all(
            categories.map((category) =>
              getToolsByCategory(category.id, {
                page: 1,
                pageSize: 24,
                sortBy: mapSortToApi(sortBy),
              })
            )
          );

          tools = categoryResults.flatMap((result) => result.items);
        } else {
          const matchedCategory = categories.find(
            (category) => category.slug === selectedCategory
          );

          if (matchedCategory) {
            const result = await getToolsByCategory(matchedCategory.id, {
              page: 1,
              pageSize: 50,
              sortBy: mapSortToApi(sortBy),
            });
            tools = result.items;
          }
        }

        const deduplicated = Array.from(
          new Map(tools.map((tool) => [tool.id, tool])).values()
        );
        const mappedItems = deduplicated.map(toCatalogueItem);
        const sorted = sortItems(mappedItems, sortBy);

        if (!isMounted) return;
        setItems(availableOnly ? sorted.filter((item) => item.available) : sorted);
      } catch (toolsError) {
        if (!isMounted) return;
        setError(
          toolsError instanceof Error ? toolsError.message : "Failed to load tools."
        );
        setItems([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTools();

    return () => {
      isMounted = false;
    };
  }, [categories, debouncedSearch, selectedCategory, sortBy, availableOnly]);

  const filterOptions = useMemo(
    () => [
      { slug: "all", name: "All Categories" },
      ...categories.map((category) => ({
        slug: category.slug,
        name: category.name,
      })),
    ],
    [categories]
  );

  return (
    <section className="min-h-screen bg-slate-50 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-1.5">
            Equipment Catalogue
          </h1>
          <p className="text-sm text-slate-600">
            Browse our selection of professional tools and equipment for rent.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setSearchExpanded((current) => !current)}
                aria-label="Toggle search"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
              >
                <Search className="h-4 w-4" />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  searchExpanded ? "ml-2 w-72 max-w-full opacity-100" : "w-0 opacity-0"
                }`}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchExpanded(true)}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
              {filterOptions.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.slug
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-1">
                  {filterOptions.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        selectedCategory === category.slug
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <p className="text-sm text-slate-600">
            Showing <span className="text-slate-900 font-semibold">{items.length}</span> results
          </p>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 bg-white text-accent focus:ring-accent"
              />
              <span className="text-sm text-slate-600">Available only</span>
            </label>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-slate-200 rounded-md pl-3 pr-9 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name A-Z</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-md p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-20">
            <Spinner size="md" text="Loading tools..." />
          </div>
        ) : items.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className={`group bg-white border border-slate-200 rounded-md overflow-hidden hover:border-slate-400 transition-colors ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <div
                  className={`relative overflow-hidden bg-slate-100 ${
                    viewMode === "list" ? "w-48 shrink-0" : "h-44"
                  }`}
                >
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
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                        item.available
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {item.available ? "Available" : "Rented"}
                    </span>
                  </div>
                </div>

                <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                  {item.hasEnoughReviewsToRate ? (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-slate-900 font-semibold text-sm">
                        {item.rating.toFixed(1)}
                      </span>
                      <span className="text-slate-500 text-xs">({item.reviewCount})</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mb-1.5">
                      {item.ratingMessage || "Newly listed"}
                    </p>
                  )}

                  <h3 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-accent transition-colors line-clamp-1">
                    {item.name}
                  </h3>

                  {viewMode === "list" && (
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div
                    className={`grid grid-cols-3 gap-1.5 ${
                      viewMode === "list" ? "max-w-xs" : "mb-3"
                    }`}
                  >
                    <div className="border border-slate-200 rounded-md p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-0.5">
                        <Clock className="w-3 h-3" />
                        Hour
                      </div>
                      <span className="text-slate-900 font-semibold text-sm">
                        ${item.hourlyRate}
                      </span>
                    </div>
                    <div className="border border-slate-200 rounded-md p-2 text-center">
                      <div className="text-slate-500 text-[11px] mb-0.5">Day</div>
                      <span className="text-slate-900 font-semibold text-sm">
                        ${item.dailyRate}
                      </span>
                    </div>
                    <div className="border border-slate-200 rounded-md p-2 text-center">
                      <div className="text-slate-500 text-[11px] mb-0.5">Week</div>
                      <span className="text-slate-900 font-semibold text-sm">
                        ${item.weeklyRate}
                      </span>
                    </div>
                  </div>

                  {viewMode === "grid" && (
                    <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-md transition-colors text-sm">
                      View details
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-white text-center py-16">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No equipment found
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setAvailableOnly(false);
              }}
              className="inline-flex items-center bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
