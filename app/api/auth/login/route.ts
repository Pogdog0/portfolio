import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken, verifyPassword, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const configuredHash = process.env.ADMIN_PASSWORD_HASH;
    if (!configuredEmail || !configuredHash || email !== configuredEmail || !(await verifyPassword(password, configuredHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set({ name: ADMIN_SESSION_COOKIE, value: await createSessionToken(), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 400 });
  }
}
