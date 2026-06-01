import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

export default function EquipmentNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-4 flex justify-center text-slate-400">
          <Wrench className="h-12 w-12" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900">
          Equipment not found
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          The equipment you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/equipment"
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse equipment
        </Link>
      </div>
    </div>
  );
}
