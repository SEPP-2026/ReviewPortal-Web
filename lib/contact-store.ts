// In-memory contact-message store for the prototype.
//
// Why this exists: the backend API has no contact/enquiry endpoint, but the
// public contact form needs somewhere to land so submissions aren't silently
// dropped. This mirrors lib/bookings-store.ts — records live in process memory
// and survive Next.js HMR via globalThis. Production-grade delivery (email or a
// backend table) would replace this.

import { paginate, type PagedResult } from "@/lib/pagination";

export type ContactSubject =
  | "rental"
  | "quote"
  | "support"
  | "corporate"
  | "other";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: ContactSubject;
  message: string;
  createdAt: string;
}

type Globals = typeof globalThis & {
  __reviewPortalContactMessages?: ContactMessage[];
};

const globalsRef = globalThis as Globals;
if (!globalsRef.__reviewPortalContactMessages) {
  globalsRef.__reviewPortalContactMessages = [];
}
const messages: ContactMessage[] = globalsRef.__reviewPortalContactMessages;

const generateId = () => {
  const random = Math.random().toString(36).slice(2, 8);
  const timestamp = Date.now().toString(36);
  return `msg_${timestamp}_${random}`;
};

export type ContactCreateInput = Omit<ContactMessage, "id" | "createdAt">;

export const addContactMessage = (input: ContactCreateInput): ContactMessage => {
  const record: ContactMessage = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  messages.unshift(record);
  return record;
};

export const listContactMessages = (
  options: { page?: number; pageSize?: number } = {},
): PagedResult<ContactMessage> =>
  paginate(messages, options.page, options.pageSize);

export const getContactMessagesCount = () => messages.length;
