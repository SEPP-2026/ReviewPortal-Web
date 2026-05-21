"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PenSquare, Check } from "lucide-react";
import { toast } from "sonner";

import { StarRatingInput } from "@/components/equipment/StarRatingInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createToolReview, type BackendReview } from "@/lib/backend-api";
import { reviewSchema, type ReviewValues } from "@/lib/form-schemas";
import type { CurrentUser } from "@/hooks/use-current-user";

interface ReviewSubmitFormProps {
  toolId: number;
  user: CurrentUser | null;
  onSubmitted: (review: BackendReview) => void;
}

const ratingFields: Array<{ key: keyof ReviewValues; label: string }> = [
  { key: "equipmentRating", label: "Equipment quality" },
  { key: "customerServiceRating", label: "Customer service" },
  { key: "technicalSupportRating", label: "Technical support" },
  { key: "afterSalesRating", label: "After-sales support" },
  { key: "valueForMoneyRating", label: "Value for money" },
];

const buildDefaults = (user: CurrentUser | null): ReviewValues => ({
  reviewerName: user?.name ?? "",
  reviewerEmail: user?.email ?? "",
  reviewText: "",
  equipmentRating: 0 as unknown as ReviewValues["equipmentRating"],
  customerServiceRating: 0 as unknown as ReviewValues["customerServiceRating"],
  technicalSupportRating: 0 as unknown as ReviewValues["technicalSupportRating"],
  afterSalesRating: 0 as unknown as ReviewValues["afterSalesRating"],
  valueForMoneyRating: 0 as unknown as ReviewValues["valueForMoneyRating"],
});

export function ReviewSubmitForm({
  toolId,
  user,
  onSubmitted,
}: ReviewSubmitFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: buildDefaults(user),
    mode: "onSubmit",
  });

  // Keep the form pre-populated when the user identity loads asynchronously.
  useEffect(() => {
    reset(buildDefaults(user));
  }, [user, reset]);

  const onSubmit = async (values: ReviewValues) => {
    try {
      const review = await createToolReview(toolId, {
        reviewerName: values.reviewerName.trim(),
        reviewerEmail: values.reviewerEmail.trim(),
        reviewText: values.reviewText.trim(),
        equipmentRating: values.equipmentRating,
        customerServiceRating: values.customerServiceRating,
        technicalSupportRating: values.technicalSupportRating,
        afterSalesRating: values.afterSalesRating,
        valueForMoneyRating: values.valueForMoneyRating,
      });
      toast.success("Review submitted", {
        description: "It will appear here once a moderator approves it.",
      });
      reset(buildDefaults(user));
      onSubmitted(review);
    } catch (error) {
      toast.error("Could not submit review", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <PenSquare className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-[#111111]">Write a Review</h3>
      </div>

      {isSubmitSuccessful && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Thanks for your review! It will appear after moderation.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="review-name">Your name</Label>
            <Input
              id="review-name"
              placeholder="Jane Builder"
              aria-invalid={errors.reviewerName ? "true" : undefined}
              {...register("reviewerName")}
            />
            {errors.reviewerName && (
              <p className="text-xs text-red-600">{errors.reviewerName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="review-email">Email</Label>
            <Input
              id="review-email"
              type="email"
              placeholder="jane@example.com"
              aria-invalid={errors.reviewerEmail ? "true" : undefined}
              {...register("reviewerEmail")}
            />
            {errors.reviewerEmail && (
              <p className="text-xs text-red-600">
                {errors.reviewerEmail.message}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-[#FBFBFB] p-4 space-y-3">
          {ratingFields.map((field) => (
            <Controller
              key={field.key}
              control={control}
              name={field.key}
              render={({ field: ctl, fieldState }) => (
                <div>
                  <StarRatingInput
                    label={field.label}
                    value={(ctl.value as number) ?? 0}
                    onChange={(value) => ctl.onChange(value)}
                  />
                  {fieldState.error && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="review-text">Your feedback</Label>
          <Textarea
            id="review-text"
            rows={4}
            placeholder="Tell others about your experience using this equipment (at least 20 characters)..."
            aria-invalid={errors.reviewText ? "true" : undefined}
            {...register("reviewText")}
          />
          {errors.reviewText && (
            <p className="text-xs text-red-600">{errors.reviewText.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  );
}
