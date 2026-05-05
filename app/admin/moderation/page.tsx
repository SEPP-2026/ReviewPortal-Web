import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShieldCheck, ClipboardList, Clock3 } from "lucide-react";
import { AUTH_COOKIE_NAME, serverGet } from "@/lib/server-api";
import { ModerationQueue } from "@/components/admin/ModerationQueue";

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdDate: string;
};

const STAFF_ROLES = new Set(["Admin", "Moderator"]);

export const metadata: Metadata = {
  title: "Moderation Queue | Shelton Tool-Hire",
  description: "Review and moderate pending customer submissions before publishing.",
};

export default async function ModerationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login?next=/admin/moderation");
  }

  let user: SessionUser;

  try {
    user = await serverGet<SessionUser>("/auth/me", { token });
  } catch {
    redirect("/login?next=/admin/moderation");
  }

  if (!STAFF_ROLES.has(user.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_30%),linear-gradient(180deg,_#F8FAFC_0%,_#F2F2F2_100%)] pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium uppercase tracking-[0.26em] text-amber-700">
            <ShieldCheck className="h-4 w-4" />
            Staff access only
          </div>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Moderation Queue
              </h1>
              <p className="text-lg leading-8 text-slate-600">
                Review pending customer submissions, check the user and rating details,
                and decide whether each review should be published.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[26rem]">
              <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/60">
                  <ClipboardList className="h-4 w-4" />
                  Reviewer
                </div>
                <p className="mt-2 text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-white/65">{user.role}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-950">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  Queue source
                </div>
                <p className="mt-2 text-lg font-semibold">/api/admin/moderation/pending</p>
                <p className="text-sm text-slate-600">Protected by JWT role checks.</p>
              </div>
            </div>
          </div>
        </div>

        <ModerationQueue />
      </div>
    </div>
  );
}