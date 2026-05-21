"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className:
          "rounded-xl border border-slate-200 bg-white text-sm text-slate-900 shadow-lg",
      }}
    />
  );
}
