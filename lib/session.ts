import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, serverGet } from "@/lib/server-api";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdDate: string;
}

const STAFF_ROLES = new Set(["Admin", "Moderator"]);

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await serverGet<SessionUser>("/auth/me", { token });
  } catch {
    return null;
  }
}

export const isStaff = (user: SessionUser | null) =>
  !!user && STAFF_ROLES.has(user.role);
