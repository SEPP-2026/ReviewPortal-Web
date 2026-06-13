import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const metadata = {
  title: "FAQ | Shelton Tool-Hire",
  description:
    "Answers to common questions about renting tools and equipment from Shelton Tool-Hire — hire periods, delivery, deposits, and more.",
};

const FAQ_GROUPS = [
  {
    category: "Renting & pricing",
    items: [
      {
        q: "How do hire periods work?",
        a: "Equipment can be hired hourly, daily, or weekly. You only pay for the time you need — choose the period that suits your project when you request a booking.",
      },
      {
        q: "Do I need an account to rent?",
        a: "You can browse freely, but you'll need a registered account to submit a booking request so we can confirm details and keep you updated.",
      },
      {
        q: "Is a deposit required?",
        a: "A refundable deposit may apply to higher-value equipment. The amount is shown before you confirm a booking request.",
      },
    ],
  },
  {
    category: "Delivery & collection",
    items: [
      {
        q: "Do you deliver to my site?",
        a: "Yes. We offer same-day delivery to most areas and scheduled collection when you're finished. Delivery is free on qualifying orders.",
      },
      {
        q: "Can I collect equipment myself?",
        a: "Absolutely. You're welcome to collect from and return to our depot during business hours: Mon–Sat, 7:00 AM – 6:00 PM.",
      },
    ],
  },
  {
    category: "Equipment & support",
    items: [
      {
        q: "Is the equipment maintained and safe to use?",
        a: "Every tool is professionally serviced and safety-checked between hires. If anything isn't right, contact us and we'll resolve it quickly.",
      },
      {
        q: "What if something breaks during my hire?",
        a: "Fair wear and tear is expected. For faults that aren't your fault, get in touch and we'll arrange a replacement or repair.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Help
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Frequently asked questions
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/contact" className="text-accent hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>

        <div className="space-y-8">
          {FAQ_GROUPS.map((group) => (
            <section key={group.category}>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                {group.category}
              </h2>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group bg-white border border-slate-200 rounded-md"
                  >
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-900">
                      {item.q}
                      <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180 shrink-0" />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
