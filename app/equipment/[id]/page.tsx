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
  MessageCircle,
} from "lucide-react";
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

  const [tool, setTool] = useState<BackendTool | null>(null);
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [relatedTools, setRelatedTools] = useState<BackendToolSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rentalPeriod, setRentalPeriod] = useState<"hourly" | "daily" | "weekly">(
    "daily"
  );
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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
      <div className="min-h-screen bg-[#F2F2F2] pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-[#666666]">Loading tool details...</div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error || "Tool not found."}
          </div>
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 mt-4 text-[#666666] hover:text-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Equipment
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage =
    tool.images.sort((a, b) => a.displayOrder - b.displayOrder)[0]?.imageUrl || DEFAULT_IMAGE;

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-40 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-[#666666] hover:text-accent transition-colors">
            Home
          </Link>
          <span className="text-[#666666]">/</span>
          <Link
            href="/equipment"
            className="text-[#666666] hover:text-accent transition-colors"
          >
            Equipment
          </Link>
          <span className="text-[#666666]">/</span>
          <Link
            href={`/equipment?category=${toCategorySlug(tool.categoryName)}`}
            className="text-[#666666] hover:text-accent transition-colors"
          >
            {tool.categoryName}
          </Link>
          <span className="text-[#666666]">/</span>
          <span className="text-[#111111]">{tool.name}</span>
        </nav>

        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 text-[#666666] hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equipment
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
              <img
                src={primaryImage}
                alt={tool.name}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-accent text-black text-sm font-semibold px-3 py-1 rounded-full">
                  {tool.categoryName}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    tool.isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {tool.isActive ? "Available" : "Currently Unavailable"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(tool.overallRating ?? 0)
                        ? "text-accent fill-accent"
                        : "text-gray"
                    }`}
                  />
                ))}
              </div>
              {tool.hasEnoughReviewsToRate ? (
                <>
                  <span className="text-[#111111] font-semibold">
                    {(tool.overallRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-[#666666]">({tool.reviewCount} reviews)</span>
                </>
              ) : (
                <span className="text-[#666666]">{tool.ratingMessage || "No reviews yet"}</span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-4">{tool.name}</h1>
            <p className="text-[#666666] text-lg mb-8 leading-relaxed">{tool.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setRentalPeriod("hourly")}
                className={`p-4 rounded-xl text-center transition-all ${
                  rentalPeriod === "hourly"
                    ? "bg-accent text-black ring-2 ring-accent"
                    : "bg-white border border-gray-200 text-[#111111] hover:border-accent/50"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Hourly</span>
                </div>
                <span className="text-2xl font-bold">${tool.hourlyRate}</span>
                <span className="text-sm opacity-70">/hr</span>
              </button>
              <button
                onClick={() => setRentalPeriod("daily")}
                className={`p-4 rounded-xl text-center transition-all ${
                  rentalPeriod === "daily"
                    ? "bg-accent text-black ring-2 ring-accent"
                    : "bg-white border border-gray-200 text-[#111111] hover:border-accent/50"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Daily</span>
                </div>
                <span className="text-2xl font-bold">${tool.dailyRate}</span>
                <span className="text-sm opacity-70">/day</span>
              </button>
              <button
                onClick={() => setRentalPeriod("weekly")}
                className={`p-4 rounded-xl text-center transition-all ${
                  rentalPeriod === "weekly"
                    ? "bg-accent text-black ring-2 ring-accent"
                    : "bg-white border border-gray-200 text-[#111111] hover:border-accent/50"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Weekly</span>
                </div>
                <span className="text-2xl font-bold">${tool.weeklyRate}</span>
                <span className="text-sm opacity-70">/wk</span>
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
              <h3 className="text-[#111111] font-bold text-lg mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-accent" />
                Rental Calculator
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[#666666] text-sm mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-[#F2F2F2] border border-gray-200 rounded-lg text-[#111111] hover:border-accent transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-[#111111] text-center focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-[#F2F2F2] border border-gray-200 rounded-lg text-[#111111] hover:border-accent transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[#666666] text-sm mb-2">
                    Duration ({rentalPeriod === "hourly" ? "hours" : rentalPeriod === "daily" ? "days" : "weeks"})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      className="w-10 h-10 bg-[#F2F2F2] border border-gray-200 rounded-lg text-[#111111] hover:border-accent transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-[#111111] text-center focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => setDuration(duration + 1)}
                      className="w-10 h-10 bg-[#F2F2F2] border border-gray-200 rounded-lg text-[#111111] hover:border-accent transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-[#666666]">Estimated Total:</span>
                <span className="text-3xl font-bold text-accent">
                  {estimatedCost === null ? "--" : formatCurrency(estimatedCost)}
                </span>
              </div>
              {isCalculating && <p className="text-xs text-[#666666] mt-2">Calculating...</p>}
              {costBreakdown && <p className="text-xs text-[#666666] mt-2">{costBreakdown}</p>}
            </div>

            <div className="flex gap-4 mb-8">
              <button
                disabled={!tool.isActive}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-colors ${
                  tool.isActive
                    ? "bg-accent hover:bg-[#C97F00] text-black"
                    : "bg-gray-200 text-[#999] cursor-not-allowed"
                }`}
              >
                {tool.isActive ? "Book Now" : "Not Available"}
              </button>
              <button className="px-6 py-4 bg-white border border-gray-200 rounded-xl text-[#111111] hover:border-accent transition-colors">
                <Phone className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
                <Truck className="w-6 h-6 text-accent" />
                <div>
                  <p className="text-[#111111] font-medium">Free Delivery</p>
                  <p className="text-[#666666] text-sm">Orders over $200</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
                <Shield className="w-6 h-6 text-accent" />
                <div>
                  <p className="text-[#111111] font-medium">Fully Insured</p>
                  <p className="text-[#666666] text-sm">Equipment coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
                <Clock className="w-6 h-6 text-accent" />
                <div>
                  <p className="text-[#111111] font-medium">24/7 Support</p>
                  <p className="text-[#666666] text-sm">Always available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#111111] mb-6">Specifications</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              {specifications.map((spec, index) => (
                <div
                  key={spec.key}
                  className={`flex justify-between p-4 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#F2F2F2]"
                  } border-b border-gray-200 last:border-b-0`}
                >
                  <span className="text-[#666666]">{spec.key}</span>
                  <span className="text-[#111111] font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#111111] mb-6">Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <span className="text-[#111111]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#111111] mb-6">Approved Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-[#111111]">{review.reviewerName}</p>
                    <p className="text-xs text-[#666666]">{formatDate(review.createdDate)}</p>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-4 h-4 ${
                          index < Math.round(review.overallRating)
                            ? "text-accent fill-accent"
                            : "text-gray"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-[#666666] ml-2">
                      {review.overallRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[#666666]">{review.reviewText}</p>
                  {review.comments.length > 0 && (
                    <p className="text-xs text-[#666666] mt-3 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {review.comments.length} comment(s)
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#666666]">No approved reviews yet for this tool.</p>
          )}
        </div>

        {relatedTools.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#111111] mb-6">Related Equipment</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTools.map((item) => (
                <Link
                  key={item.id}
                  href={`/equipment/${item.id}`}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-accent/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={item.thumbnailUrl || DEFAULT_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-[#111111] font-bold mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-accent font-bold">${item.dailyRate}/day</p>
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
