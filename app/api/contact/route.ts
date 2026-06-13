import { NextResponse, type NextRequest } from "next/server";
import {
  addContactMessage,
  listContactMessages,
  type ContactSubject,
} from "@/lib/contact-store";
import { getSessionUser, isStaff } from "@/lib/session";

const ALLOWED_SUBJECTS: ReadonlySet<ContactSubject> = new Set([
  "rental",
  "quote",
  "support",
  "corporate",
  "other",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: ContactSubject;
  message?: string;
}

const validate = (payload: ContactPayload): string | null => {
  if (!payload.name || typeof payload.name !== "string" || !payload.name.trim())
    return "name is required";
  if (!payload.email || typeof payload.email !== "string" || !EMAIL_RE.test(payload.email))
    return "a valid email is required";
  if (!payload.subject || !ALLOWED_SUBJECTS.has(payload.subject))
    return "subject must be one of rental, quote, support, corporate, other";
  if (
    !payload.message ||
    typeof payload.message !== "string" ||
    payload.message.trim().length < 10
  )
    return "message must be at least 10 characters";
  return null;
};

export const POST = async (request: NextRequest) => {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const error = validate(payload);
  if (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }

  const record = addContactMessage({
    name: payload.name!.trim(),
    email: payload.email!.trim(),
    phone: payload.phone?.trim() || undefined,
    subject: payload.subject!,
    message: payload.message!.trim(),
  });

  return NextResponse.json(
    { id: record.id, message: "Message received" },
    { status: 201 },
  );
};

export const GET = async () => {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ items: listContactMessages() });
};
