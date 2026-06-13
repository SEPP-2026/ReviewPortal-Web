import Link from "next/link";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Shelton Tool-Hire",
  description: "Privacy policy for Shelton Tool-Hire.",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--nav-offset)] pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Privacy Policy
          </h1>
        </div>

        {/*
          INTENTIONAL STUB — no policy text is provided here.
          A privacy policy must accurately describe real data-processing
          activities and be reviewed for legal compliance before launch.
          Do NOT auto-generate or copy boilerplate privacy text.
        */}
        <div className="bg-amber-50 border border-amber-200 rounded-md px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Content pending</p>
            <p className="mt-1 leading-relaxed">
              Our privacy policy is being prepared and will be published here
              shortly. If you have a question about how your information is
              handled, please{" "}
              <Link href="/contact" className="underline hover:no-underline">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
