import Link from "next/link";
import {
  Search,
  CalendarCheck,
  Truck,
  Star,
  UserCog,
  LifeBuoy,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";

export const metadata = {
  title: "Help Center | Shelton Tool-Hire",
  description:
    "Get help with browsing equipment, making bookings, delivery, reviews, and managing your Shelton Tool-Hire account.",
};

const TOPICS = [
  {
    icon: Search,
    title: "Finding equipment",
    body: "Search by keyword or browse categories to find the right tool for your job.",
    href: "/equipment",
    cta: "Browse catalogue",
  },
  {
    icon: CalendarCheck,
    title: "Making a booking",
    body: "Pick your hire period and quantity, then submit a booking request for confirmation.",
    href: "/equipment",
    cta: "Start a booking",
  },
  {
    icon: Truck,
    title: "Delivery & collection",
    body: "Learn how same-day delivery and scheduled collection work for your order.",
    href: "/faq",
    cta: "Read the FAQ",
  },
  {
    icon: Star,
    title: "Reviews & ratings",
    body: "See verified customer feedback, or leave a review for equipment you've hired.",
    href: "/reviews",
    cta: "View reviews",
  },
  {
    icon: UserCog,
    title: "Your account",
    body: "Manage your reviews and update your password from your account area.",
    href: "/account/reviews",
    cta: "Go to account",
  },
  {
    icon: LifeBuoy,
    title: "Still need help?",
    body: "Our team is happy to help with anything not covered here.",
    href: "/contact",
    cta: "Contact us",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Support
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Help Center
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Quick answers and starting points for getting the most out of
            Shelton Tool-Hire.
          </p>
        </div>

        {/* Topic grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {TOPICS.map(({ icon: Icon, title, body, href, cta }) => (
            <Link
              key={title}
              href={href}
              className="group bg-white border border-slate-200 rounded-md p-5 hover:border-slate-400 transition-colors"
            >
              <div className="h-9 w-9 rounded-md bg-accent/10 text-accent flex items-center justify-center mb-3">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                {body}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                {cta}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Direct contact */}
        <div className="bg-white border border-slate-200 rounded-md px-6 py-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Talk to us directly
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <a
              href="tel:+1234567890"
              className="flex items-center gap-2.5 text-slate-700 hover:text-accent transition-colors"
            >
              <Phone className="h-4 w-4 text-slate-400" />
              +1 (234) 567-890
            </a>
            <a
              href="mailto:info@sheltontoolhire.com"
              className="flex items-center gap-2.5 text-slate-700 hover:text-accent transition-colors"
            >
              <Mail className="h-4 w-4 text-slate-400" />
              info@sheltontoolhire.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
