"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { resetPassword } from "@/lib/backend-api";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/form-schemas";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      token: searchParams.get("token") ?? "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Re-sync when the query params change (e.g. arriving from the forgot flow).
  useEffect(() => {
    reset({
      email: searchParams.get("email") ?? "",
      token: searchParams.get("token") ?? "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [searchParams, reset]);

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      const result = await resetPassword({
        email: values.email,
        resetToken: values.token,
        newPassword: values.newPassword,
      });
      toast.success(result.message || "Password reset successfully");
      setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      setError("token", {
        message:
          error instanceof Error ? error.message : "Failed to reset password.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="mx-auto max-w-md px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Reset password
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Enter your reset token and choose a new password.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                aria-invalid={errors.email ? "true" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset-token">Reset token</Label>
              <Input
                id="reset-token"
                type="text"
                aria-invalid={errors.token ? "true" : undefined}
                {...register("token")}
              />
              {errors.token && (
                <p className="text-xs text-red-600">{errors.token.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset-new-password">New password</Label>
              <Input
                id="reset-new-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={errors.newPassword ? "true" : undefined}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset-confirm-password">Confirm new password</Label>
              <Input
                id="reset-confirm-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={errors.confirmPassword ? "true" : undefined}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner fullHeight text="Loading..." />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
