"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { loginSchema, type LoginValues } from "@/lib/form-schemas";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setError("password", {
          message: data?.message || "Login failed. Try again.",
        });
        return;
      }

      window.dispatchEvent(new Event("auth:changed"));
      toast.success("Signed in");
      router.push(searchParams.get("next") || "/");
      router.refresh();
    } catch {
      setError("password", {
        message: "Unable to connect. Please try again.",
      });
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
            <p className="text-sm text-gray-600 mt-2">
              Use your ReviewPortal credentials.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-5"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
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

              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  aria-invalid={errors.password ? "true" : undefined}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-sm text-gray-600">
              <span>
                New here?{" "}
                <Link className="text-accent font-semibold" href="/register">
                  Create an account
                </Link>
              </span>
              <span>
                Forgot your password?{" "}
                <Link
                  className="text-accent font-semibold"
                  href="/forgot-password"
                >
                  Reset it here
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner fullHeight text="Loading..." />}>
      <LoginContent />
    </Suspense>
  );
}
