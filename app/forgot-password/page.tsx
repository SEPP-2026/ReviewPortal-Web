"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/backend-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);
    setResetToken(null);

    try {
      const result = await forgotPassword({ email });
      setMessage(result.message);
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to request reset."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white pt-32 pb-20">
      <div className="mx-auto max-w-md px-6">
        <div className="rounded-2xl bg-white p-8 text-black shadow-xl">
          <h1 className="text-2xl font-semibold">Forgot your password?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we will send instructions for resetting.
          </p>

          {message && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
              {resetToken && (
                <div className="mt-2">
                  <p className="font-semibold">Reset token (development):</p>
                  <p className="break-all text-xs text-emerald-900">{resetToken}</p>
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
          {errorMessage && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#C97F00] disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send reset instructions"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
