"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Layers,
  ShieldCheck,
} from "lucide-react";

const ALL_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, adminOnly: true },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck, adminOnly: false },
  { href: "/admin/tools", label: "Tools", icon: Wrench, adminOnly: true },
  { href: "/admin/categories", label: "Categories", icon: Layers, adminOnly: true },
];

interface AdminShellProps {
  title: string;
  description?: string;
  userName: string;
  userRole: string;
  children: React.ReactNode;
}

export function AdminShell({
  title,
  description,
  userName,
  userRole,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "Admin";

  const navItems = ALL_NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_30%),linear-gradient(180deg,_#F8FAFC_0%,_#F2F2F2_100%)] pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.26em] text-amber-700">
                <ShieldCheck className="h-4 w-4" />
                Staff console
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
              )}
            </div>
            <div className="rounded-2xl bg-slate-950 px-5 py-3 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                Signed in as
              </p>
              <p className="mt-1 text-base font-semibold">{userName}</p>
              <p className="text-xs text-white/70">{userRole}</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-950 text-white shadow"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {children}
      </div>
    </div>
  );
}
