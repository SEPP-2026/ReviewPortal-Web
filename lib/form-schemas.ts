// Shared zod schemas for client forms. Each rule mirrors the backend
// FluentValidation validator so the UI surfaces the same constraint
// the API will enforce.

import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Must include at least one uppercase letter")
  .regex(/\d/, "Must include at least one digit");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  email: z.string().email("Enter a valid email"),
  password: passwordRule,
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const ratingRule = z
  .number({ invalid_type_error: "Choose a rating" })
  .int()
  .min(1, "Choose a rating from 1 to 5")
  .max(5, "Choose a rating from 1 to 5");

export const reviewSchema = z.object({
  reviewerName: z
    .string()
    .min(1, "Your name is required")
    .max(100, "Name must be 100 characters or fewer"),
  reviewerEmail: z.string().email("Enter a valid email"),
  reviewText: z
    .string()
    .min(20, "Review must be at least 20 characters")
    .max(2000, "Review must be 2000 characters or fewer"),
  equipmentRating: ratingRule,
  customerServiceRating: ratingRule,
  technicalSupportRating: ratingRule,
  afterSalesRating: ratingRule,
  valueForMoneyRating: ratingRule,
});
export type ReviewValues = z.infer<typeof reviewSchema>;

export const commentSchema = z.object({
  commenterName: z
    .string()
    .min(1, "Your name is required")
    .max(100, "Name must be 100 characters or fewer"),
  commentText: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must be 1000 characters or fewer"),
});
export type CommentValues = z.infer<typeof commentSchema>;

export const companyResponseSchema = z.object({
  responseText: z
    .string()
    .min(1, "Response is required")
    .max(2000, "Response must be 2000 characters or fewer"),
});
export type CompanyResponseValues = z.infer<typeof companyResponseSchema>;

const optionalUrl = z
  .string()
  .trim()
  .max(500, "URL must be 500 characters or fewer")
  .refine(
    (value) => {
      if (value === "") return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Must be a valid URL" },
  );

export const adminCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
  imageUrl: optionalUrl.optional().or(z.literal("")),
});
export type AdminCategoryValues = z.infer<typeof adminCategorySchema>;

const positiveAmount = z.coerce
  .number({ invalid_type_error: "Enter a number" })
  .nonnegative("Must be zero or greater");

export const adminToolSchema = z
  .object({
    categoryId: z.coerce
      .number({ invalid_type_error: "Choose a category" })
      .int()
      .positive("Choose a category"),
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(200, "Name must be 200 characters or fewer"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(2000, "Description must be 2000 characters or fewer"),
    hourlyRate: positiveAmount,
    dailyRate: positiveAmount,
    weeklyRate: positiveAmount,
    specialNotes: z
      .string()
      .max(1000, "Notes must be 1000 characters or fewer")
      .optional()
      .or(z.literal("")),
    depositRequired: z.boolean(),
    depositAmount: z
      .union([z.coerce.number().nonnegative(), z.literal("")])
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.depositRequired &&
      (value.depositAmount === undefined ||
        value.depositAmount === "" ||
        Number(value.depositAmount) <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Deposit amount is required when a deposit is required.",
        path: ["depositAmount"],
      });
    }
  });
export type AdminToolValues = z.infer<typeof adminToolSchema>;

export const rejectionReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required")
    .max(500, "Reason must be 500 characters or fewer"),
});
export type RejectionReasonValues = z.infer<typeof rejectionReasonSchema>;
