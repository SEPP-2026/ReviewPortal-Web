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
  ArrowRight,
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
  const iconClasses = {
    default: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
  }[tint];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className={`rounded-md p-1.5 ${iconClasses}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
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
      <div className="rounded-md border border-slate-200 bg-white p-10">
        <Spinner size="md" text="Loading dashboard..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
            <Star className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Top rated tools
            </h2>
          </div>
          {stats.topRatedTools.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-600">
              Not enough rated tools yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.topRatedTools.map((tool) => (
                <li
                  key={tool.toolId}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <Link
                    href={`/equipment/${tool.toolId}`}
                    className="text-sm font-medium text-slate-800 hover:text-accent"
                  >
                    {tool.toolName}
                  </Link>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
            <MessagesSquare className="h-4 w-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Most reviewed tools
            </h2>
          </div>
          {stats.mostReviewedTools.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-600">
              No reviewed tools yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.mostReviewedTools.map((tool) => (
                <li
                  key={tool.toolId}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <Link
                    href={`/equipment/${tool.toolId}`}
                    className="text-sm font-medium text-slate-800 hover:text-accent"
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

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
        </div>
        <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
          {[
            {
              href: "/admin/moderation",
              title: "Moderation queue",
              desc: "Approve or reject pending content.",
            },
            {
              href: "/admin/tools",
              title: "Manage tools",
              desc: "Add, edit, deactivate equipment.",
            },
            {
              href: "/admin/categories",
              title: "Manage categories",
              desc: "Keep the catalogue tidy.",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-white p-5 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {action.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
