"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  LayoutDashboard,
  Wrench,
  Layers,
  ShieldCheck,
} from "lucide-react";

const ALL_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, adminOnly: true },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck, adminOnly: false },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, adminOnly: false },
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
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-md border border-slate-200 bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4 p-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Staff console
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {title}
              </h1>
              {description && (
                <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-2.5">
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                {userName
                  .split(" ")
                  .map((part) => part[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {userName}
                </p>
                <p className="text-xs text-slate-500">{userRole}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-1 border-t border-slate-200 px-3 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}
