"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrorMessage(data?.message || "Registration failed. Try again.");
        return;
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
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent/80">
              Create account
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mt-4">
              Join ReviewPortal to book rentals faster.
            </h1>
            <p className="text-white/70 mt-4 max-w-md">
              Keep a history of tool hires, manage reviews, and get priority
              support on every rental.
            </p>
          </div>

          <div className="bg-white text-black rounded-2xl shadow-xl p-8 border border-white/10">
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <p className="text-sm text-gray mt-2">
              It only takes a minute.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-medium">Full name</span>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Jordan Smith"
                  required
                />
              </label>

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
                  placeholder="Create a strong password"
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-sm text-gray mt-6">
              Already have an account?{" "}
              <Link className="text-accent font-semibold" href="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
