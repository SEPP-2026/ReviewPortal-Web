import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, serverGet } from "@/lib/server-api";
import type { ApiError } from "@/types/api";

type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdDate: string;
};

export const GET = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const user = await serverGet<UserResponse>("/auth/me", { token });
    return NextResponse.json(user);
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.statusCode || 500 }
    );
  }
};
