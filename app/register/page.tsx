"use client";

import Link from "next/link";
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
            <p className="text-sm text-gray-600 mt-2">
              It only takes a minute. Passwords need 8+ characters with an
              uppercase letter and a digit.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-5"
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-sm text-gray-600 mt-6">
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
