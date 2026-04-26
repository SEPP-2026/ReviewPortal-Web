"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://reviewportal-api-escdb3f2epg8eeha.southeastasia-01.azurewebsites.net/api";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrorMessage(data?.message || "Login failed. Try again.");
        return;
      }

      if (data?.token) {
        const expires = data.expiry
          ? `; expires=${new Date(data.expiry).toUTCString()}`
          : "";
        const secure =
          typeof window !== "undefined" && window.location.protocol === "https:"
            ? "; secure"
            : "";
        document.cookie = `rp_auth=${data.token}; path=/; samesite=lax${secure}${expires}`;
        window.dispatchEvent(new Event("auth:changed"));
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white pt-32 pb-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent/80">
              Welcome back
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mt-4">
              Access your rentals, reviews, and tool history.
            </h1>
            <p className="text-white/70 mt-4 max-w-md">
              Sign in to manage your bookings and leave verified feedback for the
              equipment you hire.
            </p>
          </div>

          <div className="bg-white text-black rounded-2xl shadow-xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <p className="text-sm text-gray mt-2">
              Use your ReviewPortal credentials.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Your password"
                  required
                />
              </label>

              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base hover:bg-white hover:text-black"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="text-sm text-gray mt-6">
              New here?{" "}
              <Link className="text-accent font-semibold" href="/register">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
