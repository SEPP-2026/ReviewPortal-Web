"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const FEATURES = [
  "24/7 Customer Assistance",
  "High Quality Equipment",
  "Latest Technology",
  "Custom Solutions",
];

export function AboutSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            About us
          </p>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 max-w-3xl">
            Everything you need for your project, delivered when you need it
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              Our fleet of professional-grade equipment is maintained to the
              highest standards. Whether you need tools for a few hours or
              heavy machinery for weeks, we have flexible solutions to match
              your project needs and budget.
            </p>

            <div className="bg-white border border-slate-200 rounded-md p-6">
              <div className="text-4xl font-semibold tracking-tight text-slate-900">
                35+
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Years of experience
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Serving thousands of satisfied customers.
              </p>
            </div>
          </div>

          <div className="rounded-md overflow-hidden border border-slate-200 bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=700&fit=crop&q=80"
              alt="Professional equipment operator"
              className="w-full h-[460px] object-cover"
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              From the moment you contact us to the final equipment pickup, our
              team ensures a seamless rental experience. Expert advice, on-time
              delivery, and round-the-clock support are part of every rental.
            </p>

            <div className="bg-white border border-slate-200 rounded-md">
              <div className="border-b border-slate-200 px-5 py-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  What you get
                </h3>
              </div>
              <ul className="divide-y divide-slate-100">
                {FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 px-5 py-2.5"
                  >
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm"
            >
              Learn more about us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
