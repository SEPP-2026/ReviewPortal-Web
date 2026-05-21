"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/backend-api";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/form-schemas";

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      const result = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(result.message || "Password changed");
      reset();
    } catch (error) {
      setError("currentPassword", {
        message:
          error instanceof Error ? error.message : "Failed to change password.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="change-current-password">Current password</Label>
        <Input
          id="change-current-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.currentPassword ? "true" : undefined}
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="text-xs text-red-600">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="change-new-password">New password</Label>
        <Input
          id="change-new-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.newPassword ? "true" : undefined}
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-xs text-red-600">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="change-confirm-password">Confirm new password</Label>
        <Input
          id="change-confirm-password"
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Change password"}
      </Button>
    </form>
  );
}
