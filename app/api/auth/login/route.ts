import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createSessionToken, verifyPassword, SESSION_MAX_AGE } from "@/lib/auth";

type LoginRateGlobal = typeof globalThis & { __pogdogLoginRates?: Map<string, { count: number; resetAt: number }> };

function rateKey(request: Request, email: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${forwarded || request.headers.get("x-real-ip") || "local"}:${email}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const configuredHash = process.env.ADMIN_PASSWORD_HASH;
    const key = rateKey(request, email || "unknown");
    const shared = globalThis as LoginRateGlobal;
    const rates = shared.__pogdogLoginRates ??= new Map();
    const now = Date.now();
    const rate = rates.get(key);
    if (rate && rate.resetAt > now && rate.count >= 5) {
      return NextResponse.json({ error: "Too many sign-in attempts. Try again in 15 minutes." }, { status: 429, headers: { "Retry-After": "900" } });
    }
    const passwordMatches = configuredHash ? await verifyPassword(password, configuredHash) : false;
    if (!configuredEmail || !configuredHash || email !== configuredEmail || !passwordMatches) {
      rates.set(key, rate && rate.resetAt > now ? { ...rate, count: rate.count + 1 } : { count: 1, resetAt: now + 15 * 60 * 1000 });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    rates.delete(key);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({ name: ADMIN_SESSION_COOKIE, value: await createSessionToken(), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 400 });
  }
}
