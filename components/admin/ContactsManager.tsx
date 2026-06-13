"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Inbox,
  Mail,
  Phone,
  Reply,
  RotateCcw,
  Search,
  User,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Type-only import — the store is server-side state and must not be bundled
// into this client component.
import type { ContactMessage, ContactSubject } from "@/lib/contact-store";

type SubjectFilter = "" | ContactSubject;

const SUBJECT_META: Record<
  ContactSubject,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "outline" }
> = {
  rental: { label: "Equipment rental", variant: "default" },
  quote: { label: "Request a quote", variant: "success" },
  support: { label: "Technical support", variant: "warning" },
  corporate: { label: "Corporate account", variant: "secondary" },
  other: { label: "Other", variant: "outline" },
};

const SUBJECT_FILTERS: Array<{ label: string; value: SubjectFilter }> = [
  { label: "All", value: "" },
  { label: "Rental", value: "rental" },
  { label: "Quote", value: "quote" },
  { label: "Support", value: "support" },
  { label: "Corporate", value: "corporate" },
  { label: "Other", value: "other" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

interface ApiContactsResponse {
  items: ContactMessage[];
}

export function ContactsManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/contact");
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("You don't have access to view messages.");
        }
        throw new Error("Failed to load messages.");
      }
      const data = (await response.json()) as ApiContactsResponse;
      setMessages(data.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load messages.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (subjectFilter && m.subject !== subjectFilter) return false;
      if (!term) return true;
      return (
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.message.toLowerCase().includes(term) ||
        (m.phone?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [messages, subjectFilter, search]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Inbox className="h-4 w-4 text-slate-500" />
            <span>
              <span className="font-semibold text-slate-900">
                {messages.length}
              </span>{" "}
              {messages.length === 1 ? "message" : "messages"}
            </span>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <label className="relative flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, message…"
                aria-label="Search messages"
                className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent sm:w-72"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={load}
              disabled={isLoading}
              className="rounded-md"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Subject filters */}
        <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3">
          {SUBJECT_FILTERS.map((filter) => {
            const active = subjectFilter === filter.value;
            const count =
              filter.value === ""
                ? messages.length
                : messages.filter((m) => m.subject === filter.value).length;
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => setSubjectFilter(filter.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {filter.label}
                <span
                  className={`ml-1.5 ${active ? "text-slate-300" : "text-slate-400"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            {errorMessage}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-md border border-slate-200 bg-white p-10">
          <Spinner size="md" text="Loading messages..." />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-900">
            No messages yet.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Enquiries submitted through the contact form will appear here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-900">
            No matching messages.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Try a different search term or filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((message) => {
            const subject = SUBJECT_META[message.subject];
            // Prefill the admin's mail client with recipient, subject, and a
            // body that greets the sender and quotes their original enquiry.
            const replyBody = [
              `Hi ${message.name},`,
              "",
              "Thank you for contacting Shelton Tool-Hire.",
              "",
              "",
              "---",
              `On ${formatDate(message.createdAt)} you wrote:`,
              ...message.message.split("\n").map((line) => `> ${line}`),
            ].join("\n");
            const replyHref =
              `mailto:${message.email}` +
              `?subject=${encodeURIComponent(`Re: ${subject.label} enquiry`)}` +
              `&body=${encodeURIComponent(replyBody)}`;
            return (
              <article
                key={message.id}
                className="rounded-md border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-base font-semibold text-slate-900">
                        <User className="h-4 w-4 text-slate-400" />
                        {message.name}
                      </span>
                      <Badge variant={subject.variant}>{subject.label}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Received {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <a
                    href={replyHref}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </a>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </div>
                    <p className="mt-1 text-sm">
                      <a
                        href={`mailto:${message.email}`}
                        className="hover:text-accent"
                      >
                        {message.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                      <Phone className="h-3.5 w-3.5" />
                      Phone
                    </div>
                    <p className="mt-1 text-sm">
                      {message.phone ? (
                        <a
                          href={`tel:${message.phone}`}
                          className="hover:text-accent"
                        >
                          {message.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="whitespace-pre-line">{message.message}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
