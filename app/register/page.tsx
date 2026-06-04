"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterValues } from "@/lib/form-schemas";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        // Surface backend field errors inline if provided
        if (data.errors) {
          for (const [field, messages] of Object.entries(data.errors)) {
            const key = field.charAt(0).toLowerCase() + field.slice(1);
            if (key === "name" || key === "email" || key === "password") {
              setError(key, { message: messages[0] });
            }
          }
        } else {
          setError("password", {
            message: data?.message || "Registration failed. Try again.",
          });
        }
        return;
      }

      window.dispatchEvent(new Event("auth:changed"));
      toast.success("Account created");
      router.push("/");
      router.refresh();
    } catch {
      setError("password", {
        message: "Unable to connect. Please try again.",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 pt-[var(--nav-offset)] pb-16">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2.5"
          aria-label="Shelton Tool-Hire home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
            ST
          </span>
          <span className="text-base font-semibold text-slate-900">
            Shelton <span className="text-accent">Tool-Hire</span>
          </span>
        </Link>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-8 pt-8 pb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Join Shelton Tool-Hire to book rentals and leave verified reviews.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 px-8 pb-8"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="register-name">Full name</Label>
              <Input
                id="register-name"
                autoComplete="name"
                placeholder="Jordan Smith"
                aria-invalid={errors.name ? "true" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
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
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                aria-invalid={errors.password ? "true" : undefined}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  At least 8 characters with an uppercase letter and a digit.
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-accent hover:underline" href="/login">
            Sign in
          </Link>
        </p>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secured by Shelton Tool-Hire
        </p>
      </div>
    </div>
  );
}
