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
    <div className="min-h-screen bg-[#F2F2F2] pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white bg-white p-8 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-accent">
            My account
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#111111] sm:text-4xl">
            My reviews
          </h1>
          <p className="mt-2 text-[#666666]">
            Signed in as <span className="font-medium text-[#111111]">{user.name}</span>.
            Track the moderation status of every review you have submitted.
          </p>
        </div>

        <MyReviewsList />
      </div>
    </div>
  );
}
