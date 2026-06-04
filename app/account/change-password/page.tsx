import type { Metadata } from "next";
import { requireAuthenticatedUser } from "@/lib/admin-guard";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Change Password | Shelton Tool-Hire",
};

export default async function ChangePasswordPage() {
  const user = await requireAuthenticatedUser("/account/change-password");

  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            My account
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Change password
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Update the password for <span className="font-medium text-slate-800">{user.email}</span>.
            Use at least 8 characters with one uppercase letter and one number.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
