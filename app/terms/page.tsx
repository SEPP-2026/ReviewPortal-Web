import Link from "next/link";
import { FileText, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Shelton Tool-Hire",
  description: "Terms and conditions for Shelton Tool-Hire equipment rentals.",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Terms &amp; Conditions
          </h1>
        </div>

        {/*
          INTENTIONAL STUB — no legal text is provided here.
          Terms & Conditions must be drafted/reviewed by a qualified person and
          supplied as real content before launch. Do not auto-generate this.
        */}
        <div className="bg-amber-50 border border-amber-200 rounded-md px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Content pending</p>
            <p className="mt-1 leading-relaxed">
              Our full terms and conditions are being finalised and will be
              published here shortly. In the meantime, if you have a question
              about hire terms, deposits, or your rental agreement, please{" "}
              <Link href="/contact" className="underline hover:no-underline">
                contact our team
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
