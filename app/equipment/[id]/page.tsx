"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  Clock,
  ArrowLeft,
  Check,
  Calendar,
  Truck,
  Shield,
  Phone,
  Calculator,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ReviewSubmitForm } from "@/components/equipment/ReviewSubmitForm";
import { ReviewItem } from "@/components/equipment/ReviewItem";
import { BookingRequestDialog } from "@/components/equipment/BookingRequestDialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  calculateRental,
  type BackendReview,
  type BackendTool,
  type BackendToolSummary,
  getToolById,
  getToolReviews,
  getToolsByCategory,
  toCategorySlug,
} from "@/lib/backend-api";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1581147036324-c1c2f6cd4cb2?w=900&q=80";

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const parseFeatureList = (specialNotes: string | null) => {
  if (!specialNotes) {
    return [
      "Professional maintenance checked",
      "Safety instructions provided",
      "Support available during rental",
    ];
  }

  const parts = specialNotes
    .split(/[.;\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (parts.length === 0) {
    return [specialNotes];
  }

  return parts.slice(0, 6);
};

const createRentalWindow = (
  rentalPeriod: "hourly" | "daily" | "weekly",
  duration: number
) => {
  const start = new Date();
  const end = new Date(start);

  if (rentalPeriod === "hourly") {
    end.setHours(end.getHours() + duration);
  } else if (rentalPeriod === "daily") {
    end.setDate(end.getDate() + duration);
  } else {
    end.setDate(end.getDate() + duration * 7);
  }

  return {
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
  };
};

export default function EquipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const toolId = Number(params?.id);
  const { user: currentUser, isStaff } = useCurrentUser();

  const [tool, setTool] = useState<BackendTool | null>(null);
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [reviewsMeta, setReviewsMeta] = useState<{
    avgRating: number | null;
    totalApproved: number;
    emptyMessage: string | null;
    hasNextPage: boolean;
  } | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState(false);
  const [relatedTools, setRelatedTools] = useState<BackendToolSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [rentalPeriod, setRentalPeriod] = useState<"hourly" | "daily" | "weekly">(
    "daily"
  );
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!Number.isFinite(toolId) || toolId <= 0) {
        setError("Invalid tool identifier.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [toolData, reviewData] = await Promise.all([
          getToolById(toolId),
          getToolReviews(toolId, { page: 1, pageSize: 6 }),
        ]);

        const relatedData = await getToolsByCategory(toolData.categoryId, {
          page: 1,
          pageSize: 8,
          sortBy: "rating_desc",
        });

        if (!isMounted) return;

        setTool(toolData);
        setReviews(reviewData.reviews.items);
        setReviewsMeta({
          avgRating: reviewData.averageOverallRating,
          totalApproved: reviewData.totalApprovedReviews,
          emptyMessage: reviewData.emptyStateMessage,
          hasNextPage: reviewData.reviews.hasNextPage,
        });
        setReviewPage(1);
        setRelatedTools(relatedData.items.filter((item) => item.id !== toolData.id).slice(0, 4));
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to load tool details.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [toolId]);

  useEffect(() => {
    let isMounted = true;

    const calculate = async () => {
      if (!tool) return;

      setIsCalculating(true);
      try {
        const response = await calculateRental(
          tool.id,
          createRentalWindow(rentalPeriod, duration)
        );

        if (!isMounted) return;

        setEstimatedCost(response.totalCost * quantity);
        setCostBreakdown(response.breakdown);
      } catch {
        if (!isMounted) return;

        const fallbackRate =
          rentalPeriod === "hourly"
            ? tool.hourlyRate
            : rentalPeriod === "daily"
            ? tool.dailyRate
            : tool.weeklyRate;

        setEstimatedCost(fallbackRate * duration * quantity);
        setCostBreakdown(null);
      } finally {
        if (isMounted) {
          setIsCalculating(false);
        }
      }
    };

    calculate();

    return () => {
      isMounted = false;
    };
  }, [tool, rentalPeriod, duration, quantity]);

  const loadMoreReviews = async () => {
    if (!tool || isLoadingMoreReviews) return;
    setIsLoadingMoreReviews(true);
    try {
      const nextPage = reviewPage + 1;
      const moreData = await getToolReviews(toolId, { page: nextPage, pageSize: 6 });
      setReviews((prev) => [...prev, ...moreData.reviews.items]);
      setReviewsMeta((prev) =>
        prev ? { ...prev, hasNextPage: moreData.reviews.hasNextPage } : null
      );
      setReviewPage(nextPage);
    } catch {
      // silently ignore load-more failures
    } finally {
      setIsLoadingMoreReviews(false);
    }
  };

  const features = useMemo(() => parseFeatureList(tool?.specialNotes ?? null), [tool]);

  const specifications = useMemo(() => {
    if (!tool) return [];

    return [
      { key: "Category", value: tool.categoryName },
      {
        key: "Deposit",
        value: tool.depositRequired
          ? tool.depositAmount
            ? formatCurrency(tool.depositAmount)
            : "Required"
          : "Not required",
      },
      { key: "Status", value: tool.isActive ? "Active" : "Inactive" },
      { key: "Created", value: formatDate(tool.createdDate) },
      { key: "Last Updated", value: formatDate(tool.updatedDate) },
    ];
  }, [tool]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <Spinner size="md" text="Loading tool details..." />
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error || "Tool not found."}
          </div>
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 mt-4 text-sm text-slate-600 hover:text-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to equipment
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage =
    tool.images.sort((a, b) => a.displayOrder - b.displayOrder)[0]?.imageUrl || DEFAULT_IMAGE;

  const sortedImages = [...tool.images].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center gap-1.5 text-xs mb-4 text-slate-500">
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/equipment" className="hover:text-accent transition-colors">
            Equipment
          </Link>
          <span>/</span>
          <Link
            href={`/equipment?category=${toCategorySlug(tool.categoryName)}`}
            className="hover:text-accent transition-colors"
          >
            {tool.categoryName}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{tool.name}</span>
        </nav>

        <Link
          href="/equipment"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to equipment
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="relative bg-white border border-slate-200 rounded-md overflow-hidden mb-3">
              <img
                src={selectedImageUrl || primaryImage}
                alt={tool.name}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-white/95 border border-slate-200 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-md">
                  {tool.categoryName}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                    tool.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {tool.isActive ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>

            {sortedImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {sortedImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageUrl(image.imageUrl)}
                    className={`relative aspect-square rounded-md overflow-hidden border transition-colors ${
                      (selectedImageUrl || primaryImage) === image.imageUrl
                        ? "border-accent ring-1 ring-accent"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${tool.name} - Image ${image.displayOrder}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(tool.overallRating ?? 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              {tool.hasEnoughReviewsToRate ? (
                <>
                  <span className="text-slate-900 font-semibold text-sm">
                    {(tool.overallRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-sm">
                    ({tool.reviewCount} reviews)
                  </span>
                </>
              ) : (
                <span className="text-sm text-slate-500">
                  {tool.ratingMessage || "No reviews yet"}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              {tool.name}
            </h1>
            <p className="text-slate-600 mb-6 leading-relaxed">{tool.description}</p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                onClick={() => setRentalPeriod("hourly")}
                className={`p-3 rounded-md text-left transition-colors border ${
                  rentalPeriod === "hourly"
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  Hourly
                </div>
                <span className="text-lg font-semibold text-slate-900">
                  ${tool.hourlyRate}
                </span>
                <span className="text-xs text-slate-500"> /hr</span>
              </button>
              <button
                onClick={() => setRentalPeriod("daily")}
                className={`p-3 rounded-md text-left transition-colors border ${
                  rentalPeriod === "daily"
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  Daily
                </div>
                <span className="text-lg font-semibold text-slate-900">
                  ${tool.dailyRate}
                </span>
                <span className="text-xs text-slate-500"> /day</span>
              </button>
              <button
                onClick={() => setRentalPeriod("weekly")}
                className={`p-3 rounded-md text-left transition-colors border ${
                  rentalPeriod === "weekly"
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  Weekly
                </div>
                <span className="text-lg font-semibold text-slate-900">
                  ${tool.weeklyRate}
                </span>
                <span className="text-xs text-slate-500"> /wk</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-md mb-6">
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
                <Calculator className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Rental calculator
                </h3>
              </div>
              <div className="px-5 py-4">
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Quantity
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 border border-slate-200 rounded-md text-slate-700 hover:border-slate-400 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 border border-slate-200 rounded-md text-slate-700 hover:border-slate-400 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Duration ({rentalPeriod === "hourly" ? "hours" : rentalPeriod === "daily" ? "days" : "weeks"})
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDuration(Math.max(1, duration - 1))}
                        className="w-9 h-9 border border-slate-200 rounded-md text-slate-700 hover:border-slate-400 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) =>
                          setDuration(Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      />
                      <button
                        onClick={() => setDuration(duration + 1)}
                        className="w-9 h-9 border border-slate-200 rounded-md text-slate-700 hover:border-slate-400 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Estimated total</span>
                  <span className="text-2xl font-semibold tracking-tight text-slate-900">
                    {estimatedCost === null ? "—" : formatCurrency(estimatedCost)}
                  </span>
                </div>
                {isCalculating && (
                  <p className="text-xs text-slate-500 mt-2">Calculating…</p>
                )}
                {costBreakdown && (
                  <p className="text-xs text-slate-500 mt-2">{costBreakdown}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                type="button"
                disabled={!tool.isActive}
                onClick={() => setBookingDialogOpen(true)}
                className={`flex-1 py-2.5 rounded-md font-medium text-sm transition-colors ${
                  tool.isActive
                    ? "bg-accent hover:bg-[#C97F00] text-black"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {tool.isActive ? "Book now" : "Not available"}
              </button>
              <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:border-slate-400 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-md p-3">
                <Truck className="w-4 h-4 text-slate-600 shrink-0" />
                <div>
                  <p className="text-slate-900 font-medium text-sm">Free delivery</p>
                  <p className="text-slate-500 text-xs">Orders over $200</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-md p-3">
                <Shield className="w-4 h-4 text-slate-600 shrink-0" />
                <div>
                  <p className="text-slate-900 font-medium text-sm">Fully insured</p>
                  <p className="text-slate-500 text-xs">Equipment coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-md p-3">
                <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                <div>
                  <p className="text-slate-900 font-medium text-sm">24/7 support</p>
                  <p className="text-slate-500 text-xs">Always available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Specifications
          </h2>
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {specifications.map((spec) => (
                <div
                  key={spec.key}
                  className="flex justify-between px-4 py-3 border-b border-slate-100 last:border-b-0 md:border-b md:nth-last-[2]:border-b-0"
                >
                  <span className="text-sm text-slate-600">{spec.key}</span>
                  <span className="text-sm text-slate-900 font-medium">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Features</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-md p-3"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Customer reviews
            </h2>
            {reviewsMeta && reviewsMeta.totalApproved > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(reviewsMeta.avgRating ?? 0)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-sm text-slate-900">
                  {(reviewsMeta.avgRating ?? 0).toFixed(1)}
                </span>
                <span className="text-slate-500 text-xs">
                  ({reviewsMeta.totalApproved}{" "}
                  {reviewsMeta.totalApproved === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>

          <ReviewSubmitForm
            toolId={tool.id}
            user={currentUser}
            onSubmitted={() => {
              setReviewSuccess(true);
            }}
          />

          {reviewSuccess && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              Your review has been submitted and is awaiting moderation. It will
              appear here once approved.
            </div>
          )}

          {reviews.length > 0 ? (
            <>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    currentUser={currentUser}
                    isStaff={isStaff}
                  />
                ))}
              </div>

              {reviewsMeta?.hasNextPage && (
                <div className="mt-5 text-center">
                  <button
                    onClick={loadMoreReviews}
                    disabled={isLoadingMoreReviews}
                    className="px-5 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMoreReviews ? (
                      <Spinner size="sm" />
                    ) : (
                      "Load more reviews"
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-600">
              {reviewsMeta?.emptyMessage ?? "No approved reviews yet for this tool."}
            </p>
          )}
        </div>

        <BookingRequestDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          tool={tool}
          user={currentUser}
          rentalPeriod={rentalPeriod}
          quantity={quantity}
          duration={duration}
          estimatedCost={estimatedCost}
        />

        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Related equipment
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedTools.map((item) => (
                <Link
                  key={item.id}
                  href={`/equipment/${item.id}`}
                  className="group bg-white border border-slate-200 rounded-md overflow-hidden hover:border-slate-400 transition-colors"
                >
                  <div className="relative h-36 overflow-hidden bg-slate-100">
                    <img
                      src={item.thumbnailUrl || DEFAULT_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-slate-900 mb-0.5 line-clamp-1 group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">${item.dailyRate}</span>
                      <span className="text-slate-500"> /day</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
