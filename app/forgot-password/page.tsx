"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/backend-api";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/form-schemas";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const email = watch("email");

  const onSubmit = async (values: ForgotPasswordValues) => {
    setMessage(null);
    setResetToken(null);

    try {
      const result = await forgotPassword({ email: values.email });
      setMessage(result.message);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
      toast.success("Reset email sent if the address exists");
    } catch (error) {
      setError("email", {
        message:
          error instanceof Error ? error.message : "Failed to request reset.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white pt-32 pb-20">
      <div className="mx-auto max-w-md px-6">
        <div className="rounded-2xl bg-white p-8 text-black shadow-xl">
          <h1 className="text-2xl font-semibold">Forgot your password?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we&apos;ll send instructions for resetting.
          </p>

          {message && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
              {resetToken && (
                <div className="mt-2">
                  <p className="font-semibold">Reset token (development):</p>
                  <p className="break-all text-xs text-emerald-900">
                    {resetToken}
                  </p>
                  <Link
                    href={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`}
                    className="mt-2 inline-block rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#C97F00]"
                  >
                    Continue to reset
                  </Link>
                </div>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={errors.email ? "true" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset instructions"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link
              href="/login"
              className="font-semibold text-accent hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
