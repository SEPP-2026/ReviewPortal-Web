import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, serverPost } from "@/lib/server-api";
import type { ApiError } from "@/types/api";

type AuthResponse = {
  token: string;
  name: string;
  email: string;
  role: string;
  expiry: string;
};

export const POST = async (request: NextRequest) => {
  try {
    const payload = await request.json();
    const authResponse = await serverPost<AuthResponse>(
      "/auth/login",
      payload
    );

    const expiryDate = authResponse.expiry
      ? new Date(authResponse.expiry)
      : undefined;

    const cookieStore = await cookies();
    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: authResponse.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiryDate,
    });

    return NextResponse.json({
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
      expiry: authResponse.expiry,
    });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.statusCode || 500 }
    );
  }
};
