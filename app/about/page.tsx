import Link from "next/link";
import { Shield, Truck, Clock, Wrench, Users, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us | Shelton Tool-Hire",
  description:
    "Learn about Shelton Tool-Hire — our story, our values, and our commitment to professional-grade equipment rentals.",
};

const VALUES = [
  {
    icon: Wrench,
    title: "Quality equipment",
    body: "Every tool in our fleet is professionally maintained, safety-checked, and ready for the job.",
  },
  {
    icon: Shield,
    title: "Trusted service",
    body: "We stand behind our equipment with clear hire terms and responsive support throughout your rental.",
  },
  {
    icon: Truck,
    title: "On-time delivery",
    body: "Same-day delivery and scheduled collection keep your project moving without the wait.",
  },
  {
    icon: Clock,
    title: "Flexible periods",
    body: "Hourly, daily, or weekly hire — pay for exactly the time you need, nothing more.",
  },
];

const STATS = [
  { value: "500+", label: "Tools available" },
  { value: "10k+", label: "Completed hires" },
  { value: "98%", label: "On-time delivery" },
  { value: "24/7", label: "Support access" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            About us
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Professional tool hire, done properly
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
            Shelton Tool-Hire supplies professional-grade equipment for
            construction, landscaping, plumbing and beyond. From a single power
            tool to a full site fit-out, we help tradespeople and homeowners get
            the right kit, on time, at a fair price.
          </p>
        </div>

        {/* Story */}
        <div className="bg-white border border-slate-200 rounded-md p-6 mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-2">
            Our story
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            What began as a small local depot has grown into a trusted hire
            partner for projects of every size. We built our reputation on a
            simple promise: dependable equipment, honest pricing, and people who
            actually pick up the phone. That promise still drives everything we
            do today.
          </p>
        </div>

        {/* Values */}
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          What we stand for
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="bg-white border border-slate-200 rounded-md p-5 flex items-start gap-3"
            >
              <div className="h-9 w-9 shrink-0 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-md p-5 text-center"
            >
              <p className="text-2xl font-semibold text-slate-900">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-slate-900 rounded-md px-6 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Ready to start your next project?
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Browse the catalogue or talk to our team about what you need.
              </p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/equipment"
              className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-black font-medium px-4 py-2 rounded-md transition-colors text-sm"
            >
              Browse equipment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center text-slate-200 hover:text-white font-medium px-4 py-2 rounded-md transition-colors text-sm"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
