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

// Linear, backtracking-free email check. Avoids a regex with overlapping
// quantifiers (ReDoS / js/polynomial-redos) running on user-controlled input.
const isValidEmail = (email: string): boolean => {
  if (email.length > 254 || /\s/.test(email)) return false; // RFC max length; no whitespace
  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) return false; // exactly one "@", non-empty local part
  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  return dot > 0 && dot < domain.length - 1; // domain has a dot, not first/last char
};

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
  if (!payload.email || typeof payload.email !== "string" || !isValidEmail(payload.email))
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

export const GET = async (request: NextRequest) => {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  return NextResponse.json(listContactMessages({ page, pageSize }));
};
