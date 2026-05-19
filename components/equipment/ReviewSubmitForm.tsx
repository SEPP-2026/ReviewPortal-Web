"use client";

import { useState } from "react";
import { PenSquare, Check } from "lucide-react";
import { StarRatingInput } from "@/components/equipment/StarRatingInput";
import { createToolReview, type BackendReview } from "@/lib/backend-api";
import type { CurrentUser } from "@/hooks/use-current-user";

interface ReviewSubmitFormProps {
  toolId: number;
  user: CurrentUser | null;
  onSubmitted: (review: BackendReview) => void;
}

interface FormState {
  reviewerName: string;
  reviewerEmail: string;
  reviewText: string;
  equipmentRating: number;
  customerServiceRating: number;
  technicalSupportRating: number;
  afterSalesRating: number;
  valueForMoneyRating: number;
}

const ratingFields: Array<{ key: keyof FormState; label: string }> = [
  { key: "equipmentRating", label: "Equipment quality" },
  { key: "customerServiceRating", label: "Customer service" },
  { key: "technicalSupportRating", label: "Technical support" },
  { key: "afterSalesRating", label: "After-sales support" },
  { key: "valueForMoneyRating", label: "Value for money" },
];

const initialState = (user: CurrentUser | null): FormState => ({
  reviewerName: user?.name ?? "",
  reviewerEmail: user?.email ?? "",
  reviewText: "",
  equipmentRating: 0,
  customerServiceRating: 0,
  technicalSupportRating: 0,
  afterSalesRating: 0,
  valueForMoneyRating: 0,
});

export function ReviewSubmitForm({
  toolId,
  user,
  onSubmitted,
}: ReviewSubmitFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(user));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setRating = (field: keyof FormState, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const ratingsValid = ratingFields.every(
      (field) => (form[field.key] as number) >= 1 && (form[field.key] as number) <= 5
    );

    if (!ratingsValid) {
      setErrorMessage("Please provide a rating between 1 and 5 for each category.");
      return;
    }

    if (form.reviewText.trim().length < 10) {
      setErrorMessage("Review text must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const review = await createToolReview(toolId, {
        reviewerName: form.reviewerName.trim(),
        reviewerEmail: form.reviewerEmail.trim(),
        reviewText: form.reviewText.trim(),
        equipmentRating: form.equipmentRating,
        customerServiceRating: form.customerServiceRating,
        technicalSupportRating: form.technicalSupportRating,
        afterSalesRating: form.afterSalesRating,
        valueForMoneyRating: form.valueForMoneyRating,
      });

      setSuccessMessage(
        "Thanks for your review! It will appear after moderation."
      );
      setForm(initialState(user));
      onSubmitted(review);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit review."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <PenSquare className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-[#111111]">Write a Review</h3>
      </div>

      {successMessage && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#444444] mb-1.5">
              Your name
            </label>
            <input
              type="text"
              required
              value={form.reviewerName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reviewerName: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Jane Builder"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#444444] mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={form.reviewerEmail}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reviewerEmail: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="jane@example.com"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[#FBFBFB] p-4 space-y-3">
          {ratingFields.map((field) => (
            <StarRatingInput
              key={field.key}
              label={field.label}
              value={form[field.key] as number}
              onChange={(value) => setRating(field.key, value)}
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#444444] mb-1.5">
            Your feedback
          </label>
          <textarea
            required
            value={form.reviewText}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, reviewText: event.target.value }))
            }
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Tell others about your experience using this equipment..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-black transition-colors hover:bg-[#C97F00] disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
