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
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="mx-auto max-w-md px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Join ReviewPortal to book rentals and leave verified reviews.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
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
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-accent hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
