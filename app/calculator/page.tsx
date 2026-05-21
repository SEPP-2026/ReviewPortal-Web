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
    <div className="min-h-screen bg-[#F2F2F2] pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white bg-white p-10 shadow-sm text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Calculator className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-[#111111] sm:text-4xl">
            Rental Calculator
          </h1>
          <p className="mt-3 text-[#666666] sm:text-lg">
            Costs depend on the specific tool you hire. Pick a tool from the
            catalogue and the calculator on its detail page will work out the
            cheapest combination of hourly, daily, and weekly rates for your
            dates.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-black shadow-sm transition-colors hover:bg-[#C97F00]"
            >
              Browse all equipment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-[#111111] hover:border-accent hover:text-accent"
            >
              Browse services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
