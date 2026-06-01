import type { Metadata } from "next";
import { requireAuthenticatedUser } from "@/lib/admin-guard";
import { MyReviewsList } from "@/components/account/MyReviewsList";

export const metadata: Metadata = {
  title: "My Reviews | Shelton Tool-Hire",
  description: "Track the status of reviews you've submitted.",
};

export default async function MyReviewsPage() {
  const user = await requireAuthenticatedUser("/account/reviews");

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            My account
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            My reviews
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Signed in as <span className="font-medium text-slate-800">{user.name}</span>.
            Track the moderation status of every review you have submitted.
          </p>
        </div>

        <MyReviewsList />
      </div>
    </div>
  );
}
