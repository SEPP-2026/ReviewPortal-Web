"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  Star,
  MessagesSquare,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  getDashboardStats,
  type BackendDashboardStats,
} from "@/lib/backend-api";

const StatCard = ({
  icon: Icon,
  label,
  value,
  tint = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tint?: "default" | "amber" | "emerald" | "rose";
}) => {
  const tintClasses = {
    default: "bg-white border-slate-200 text-slate-950",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
  }[tint];

  return (
    <div
      className={`rounded-3xl border p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] ${tintClasses}`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/70 p-2.5">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] opacity-80">
          {label}
        </p>
      </div>
      <p className="mt-4 text-4xl font-semibold">{value}</p>
    </div>
  );
};

export function AdminDashboard() {
  const [stats, setStats] = useState<BackendDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await getDashboardStats();
        if (isMounted) setStats(data);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load dashboard."
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10">
        <Spinner size="md" text="Loading dashboard..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          label="Active tools"
          value={stats.totalActiveTools}
          tint="emerald"
        />
        <StatCard
          icon={Wrench}
          label="Inactive tools"
          value={stats.totalInactiveTools}
          tint="rose"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending moderation"
          value={stats.pendingModerationCount}
          tint="amber"
        />
        <StatCard
          icon={CalendarClock}
          label="Reviews this month"
          value={stats.reviewsPublishedThisMonth}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-950">Top rated tools</h2>
            </div>
          </div>
          {stats.topRatedTools.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">
              Not enough rated tools yet.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {stats.topRatedTools.map((tool) => (
                <li
                  key={tool.toolId}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <Link
                    href={`/equipment/${tool.toolId}`}
                    className="text-sm font-semibold text-slate-900 hover:text-accent"
                  >
                    {tool.toolName}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">
                      {tool.overallRating?.toFixed(1) ?? "—"}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({tool.reviewCount})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-950">Most reviewed tools</h2>
          </div>
          {stats.mostReviewedTools.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">No reviewed tools yet.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {stats.mostReviewedTools.map((tool) => (
                <li
                  key={tool.toolId}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <Link
                    href={`/equipment/${tool.toolId}`}
                    className="text-sm font-semibold text-slate-900 hover:text-accent"
                  >
                    {tool.toolName}
                  </Link>
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">{tool.reviewCount}</span>
                    <span className="ml-1 text-xs text-slate-500">reviews</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <h2 className="text-lg font-semibold text-slate-950">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            href="/admin/moderation"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-amber-50 hover:border-amber-200"
          >
            <p className="text-sm font-semibold text-slate-900">Moderation queue</p>
            <p className="mt-1 text-xs text-slate-600">Approve or reject pending content.</p>
          </Link>
          <Link
            href="/admin/tools"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
          >
            <p className="text-sm font-semibold text-slate-900">Manage tools</p>
            <p className="mt-1 text-xs text-slate-600">Add, edit, deactivate equipment.</p>
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
          >
            <p className="text-sm font-semibold text-slate-900">Manage categories</p>
            <p className="mt-1 text-xs text-slate-600">Keep the catalogue tidy.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
