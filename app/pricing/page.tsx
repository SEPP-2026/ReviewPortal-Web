import Link from "next/link";
import { Check, ArrowRight, Calculator } from "lucide-react";

const PRICING_PLANS = [
  {
    name: "Hourly",
    description: "Perfect for quick jobs",
    highlight: false,
    features: [
      "Minimum 2-hour rental",
      "Best for small repairs",
      "No deposit required",
      "Basic support included",
    ],
    examples: [
      { name: "Power Drill", price: "$8/hr" },
      { name: "Pressure Washer", price: "$10/hr" },
      { name: "Generator", price: "$15/hr" },
    ],
  },
  {
    name: "Daily",
    description: "Most popular choice",
    highlight: true,
    badge: "BEST VALUE",
    features: [
      "24-hour rental period",
      "Up to 40% savings vs hourly",
      "Free damage waiver",
      "Priority support",
      "Flexible pickup times",
    ],
    examples: [
      { name: "Power Drill", price: "$35/day" },
      { name: "Pressure Washer", price: "$45/day" },
      { name: "Generator", price: "$65/day" },
    ],
  },
  {
    name: "Weekly",
    description: "For ongoing projects",
    highlight: false,
    features: [
      "7-day rental period",
      "Up to 60% savings vs daily",
      "Free delivery over $200",
      "Dedicated support line",
      "Equipment swap available",
    ],
    examples: [
      { name: "Power Drill", price: "$150/wk" },
      { name: "Pressure Washer", price: "$180/wk" },
      { name: "Generator", price: "$280/wk" },
    ],
  },
];

const INCLUDED_FEATURES = [
  "All equipment fully maintained",
  "Safety instructions provided",
  "Accessories included",
  "24/7 technical support",
  "Insurance coverage",
  "Flexible returns",
];

export const metadata = {
  title: "Pricing Plans | Shelton Tool-Hire",
  description:
    "Transparent pricing for equipment rental. Hourly, daily, and weekly rates available.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Simple pricing
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Flexible rental plans
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Choose the rental period that suits your project. The longer you
            rent, the more you save.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-md p-6 ${
                plan.highlight
                  ? "bg-white border-2 border-slate-900"
                  : "bg-white border border-slate-200"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-0.5 rounded-md">
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-2 mb-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 mb-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                  Example prices
                </p>
                {plan.examples.map((example) => (
                  <div
                    key={example.name}
                    className="flex justify-between items-center py-0.5 text-sm"
                  >
                    <span className="text-slate-600">{example.name}</span>
                    <span className="font-semibold text-slate-900">
                      {example.price}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/equipment"
                className={`block w-full text-center py-2 rounded-md font-medium text-sm transition-colors ${
                  plan.highlight
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "border border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900"
                }`}
              >
                Browse equipment
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6 mb-10 text-center">
          <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 mb-3">
            <Calculator className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1.5">
            Need an exact quote?
          </h2>
          <p className="text-sm text-slate-600 mb-4 max-w-lg mx-auto">
            Use our rental calculator to get accurate pricing for your specific
            equipment and rental duration.
          </p>
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm"
          >
            Calculate rental cost
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">
            All rentals include
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {INCLUDED_FEATURES.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-md p-3"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
