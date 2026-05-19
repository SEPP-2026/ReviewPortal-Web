import type { Metadata } from "next";
import { requireAuthenticatedUser } from "@/lib/admin-guard";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Change Password | Shelton Tool-Hire",
};

export default async function ChangePasswordPage() {
  const user = await requireAuthenticatedUser("/account/change-password");

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-32 pb-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white bg-white p-8 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-accent">
            My account
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#111111]">
            Change password
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Update the password for <span className="font-medium">{user.email}</span>.
            Use at least 8 characters with one uppercase letter and one number.
          </p>

          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
