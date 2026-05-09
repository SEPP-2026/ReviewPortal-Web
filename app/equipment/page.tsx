import { Suspense } from "react";
import { EquipmentCatalogue } from "@/components/equipment";
import { Spinner } from "@/components/ui/spinner";

export const metadata = {
  title: "Equipment Catalogue | Shelton Tool-Hire",
  description:
    "Browse our selection of professional tools and equipment for rent. Construction, landscaping, plumbing, and more.",
};

export default function EquipmentPage() {
  return (
    <Suspense
      fallback={
        <Spinner fullHeight text="Loading equipment catalogue..." />
      }
    >
      <EquipmentCatalogue />
    </Suspense>
  );
}
