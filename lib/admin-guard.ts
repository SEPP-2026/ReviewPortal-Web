import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, serverGet } from "@/lib/server-api";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdDate: string;
};

const STAFF_ROLES = new Set(["Admin", "Moderator"]);
const ADMIN_ONLY = new Set(["Admin"]);

export async function requireStaffUser(redirectPath: string): Promise<SessionUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect(`/login?next=${encodeURIComponent(redirectPath)}`);
  }

  let user: SessionUser;
  try {
    user = await serverGet<SessionUser>("/auth/me", { token });
  } catch {
    redirect(`/login?next=${encodeURIComponent(redirectPath)}`);
  }

  if (!STAFF_ROLES.has(user.role)) {
    redirect("/");
  }

  return user;
}

export async function requireAdminUser(redirectPath: string): Promise<SessionUser> {
  const user = await requireStaffUser(redirectPath);
  if (!ADMIN_ONLY.has(user.role)) {
    redirect("/admin/moderation");
  }
  return user;
}

export async function requireAuthenticatedUser(redirectPath: string): Promise<SessionUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect(`/login?next=${encodeURIComponent(redirectPath)}`);
  }

  try {
    return await serverGet<SessionUser>("/auth/me", { token });
  } catch {
    redirect(`/login?next=${encodeURIComponent(redirectPath)}`);
  }
}
