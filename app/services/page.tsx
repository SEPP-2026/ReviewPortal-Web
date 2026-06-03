import Link from "next/link";
import {
  Truck,
  Wrench,
  Clock,
  Shield,
  Phone,
  Users,
  Settings,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const SERVICES = [
  {
    icon: Wrench,
    title: "Equipment Rental",
    description:
      "Wide range of professional tools and equipment available for hourly, daily, or weekly rental. From power tools to heavy machinery.",
    features: [
      "500+ tools available",
      "Flexible rental periods",
      "Competitive pricing",
      "Quality guaranteed",
    ],
  },
  {
    icon: Truck,
    title: "Delivery & Collection",
    description:
      "We deliver equipment directly to your job site and collect it when you're done. Free delivery on orders over $200.",
    features: [
      "Same-day delivery",
      "Free over $200",
      "Scheduled pickups",
      "GPS tracking",
    ],
  },
  {
    icon: Settings,
    title: "Equipment Training",
    description:
      "Get proper training on how to use equipment safely and efficiently. Our experts will show you the ropes.",
    features: [
      "Safety briefings",
      "Usage tutorials",
      "Best practices",
      "Certificate provided",
    ],
  },
  {
    icon: Shield,
    title: "Insurance Coverage",
    description:
      "All our equipment comes with comprehensive insurance coverage. Rent with peace of mind.",
    features: [
      "Damage protection",
      "Theft coverage",
      "Liability included",
      "Easy claims",
    ],
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Round-the-clock technical support for any issues you might face. We're always here to help.",
    features: [
      "Phone support",
      "Email assistance",
      "On-site help",
      "Emergency repairs",
    ],
  },
  {
    icon: Users,
    title: "Corporate Accounts",
    description:
      "Special pricing and benefits for businesses with regular rental needs. Build a lasting partnership.",
    features: [
      "Volume discounts",
      "Priority booking",
      "Dedicated manager",
      "Monthly billing",
    ],
  },
];

export const metadata = {
  title: "Our Services | Shelton Tool-Hire",
  description:
    "Explore our comprehensive equipment rental services including delivery, training, and 24/7 support.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            What we offer
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Our services
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            From equipment rental to delivery and technical support, we provide
            comprehensive services to make your project a success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="bg-white border border-slate-200 rounded-md p-5 hover:border-slate-400 transition-colors"
            >
              <div className="h-10 w-10 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                <service.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                {service.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-1.5 pt-3 border-t border-slate-100">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Ready to get started?
          </h2>
          <p className="text-sm text-slate-600 mb-6 max-w-xl mx-auto">
            Browse our equipment catalogue or contact us to discuss your project
            requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm"
            >
              Browse equipment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-medium px-4 py-2 rounded-md transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
