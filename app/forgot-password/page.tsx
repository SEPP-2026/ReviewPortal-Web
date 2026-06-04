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
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="mx-auto max-w-md px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Forgot your password?
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Enter your email and we&apos;ll send reset instructions.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6">
          {message && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
              {resetToken && (
                <div className="mt-2">
                  <p className="font-semibold">Reset token (development):</p>
                  <p className="break-all text-xs text-emerald-900">
                    {resetToken}
                  </p>
                  <Link
                    href={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`}
                    className="mt-2 inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-black hover:bg-[#C97F00]"
                  >
                    Continue to reset
                  </Link>
                </div>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
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
              variant="default"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset instructions"}
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
