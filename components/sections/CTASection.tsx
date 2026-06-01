"use client";

import Link from "next/link";
import { Calculator, Calendar, Truck, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Calculator,
    title: "Instant pricing",
    body: "Calculate rental costs for hourly, daily, or weekly periods.",
  },
  {
    icon: Calendar,
    title: "Easy booking",
    body: "Book online 24/7 and manage your rentals anytime.",
  },
  {
    icon: Truck,
    title: "Free delivery",
    body: "Free delivery on orders over $200 within 20 miles.",
  },
  {
    icon: Truck,
    title: "Expert support",
    body: "Technical advice and after-hire support from our team.",
  },
];

export function CTASection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-8 md:p-10 items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Get started
              </p>
              <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                Ready to start your project?
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-lg">
                Use our rental calculator to estimate costs, choose your
                equipment, and book online in minutes. Delivery available.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate rental cost
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-medium px-4 py-2 rounded-md transition-colors text-sm"
                >
                  Contact us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="border border-slate-200 rounded-md p-4"
                >
                  <div className="h-8 w-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
