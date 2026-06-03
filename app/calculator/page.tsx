import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";

export const metadata: Metadata = {
  title: "Rental Calculator | Shelton Tool-Hire",
  description:
    "Choose a tool to see hourly, daily, and weekly rates and calculate the cheapest combination for your hire period.",
};

export default function CalculatorLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <Calculator className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            Rental calculator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Costs depend on the specific tool you hire. Pick a tool from the
            catalogue and the calculator on its detail page will work out the
            cheapest combination of hourly, daily, and weekly rates for your
            dates.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Browse all equipment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              Browse services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
