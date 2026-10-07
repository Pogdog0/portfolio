import { NextResponse } from "next/server";
import { createEnquiry, setEnquiryDeliveryStatus } from "@/lib/content-store";

const projectTypes = new Set([
  "Production debugging",
  "Gameplay systems",
  "Vehicle systems",
  "UI / controller navigation",
  "Performance optimization",
]);

type ContactRateGlobal = typeof globalThis & { __pogdogContactRates?: Map<string, { count: number; resetAt: number }> };

function acceptsSubmission(request: Request) {
  const shared = globalThis as ContactRateGlobal;
  const rates = shared.__pogdogContactRates ??= new Map();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || request.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const configured = Number(process.env.CONTACT_RATE_LIMIT || 5);
  const limit = Number.isFinite(configured) ? Math.min(50, Math.max(1, Math.round(configured))) : 5;
  const current = rates.get(key);
  if (!current || current.resetAt <= now) {
    rates.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(body: Record<string, unknown>, key: string, maxLength: number) {
  const value = body[key];
  if (typeof value !== "string" || value.length > maxLength) return null;
  return value.trim();
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 12_000) return NextResponse.json({ error: "Message is too large." }, { status: 413 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  if (!isRecord(payload)) return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });

  // Quietly accept bot submissions caught by the hidden honeypot field.
  if (typeof payload.company === "string" && payload.company.trim()) return NextResponse.json({ ok: true });

  const name = readText(payload, "name", 120);
  const email = readText(payload, "email", 254);
  const discord = readText(payload, "discord", 100) ?? "";
  const projectType = readText(payload, "projectType", 80) ?? "";
  const description = readText(payload, "description", 5000);
  const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || name.length < 2 || !validEmail || !description || description.length < 10 || (projectType && !projectTypes.has(projectType))) {
    return NextResponse.json({ error: "Check your name, email, project type, and message, then try again." }, { status: 400 });
  }
  if (!acceptsSubmission(request)) return NextResponse.json({ error: "Too many enquiries were sent from this connection. Please try again later." }, { status: 429, headers: { "Retry-After": "900" } });

  let enquiry;
  try {
    enquiry = createEnquiry({ name, email, discord, projectType, description });
  } catch (error) {
    console.error("Unable to store contact enquiry", error);
    return NextResponse.json({ error: "Your message could not be saved. Please email poggerscape3@gmail.com directly." }, { status: 503 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !recipient) {
    return NextResponse.json({ ok: true, delivery: "stored" }, { status: 201 });
  }

  const from = process.env.CONTACT_FROM_EMAIL?.trim() || "Pogdog Portfolio <onboarding@resend.dev>";
  const text = [
    "New portfolio enquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Discord: ${discord || "Not provided"}`,
    `Project type: ${projectType || "Not specified"}`,
    "",
    "What needs solving:",
    description,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: email,
        subject: `Portfolio enquiry: ${projectType || "general"}`,
        text,
      }),
    });

    if (!response.ok) {
      console.error("Contact email provider returned an error", response.status);
      setEnquiryDeliveryStatus(enquiry.id, "failed");
      return NextResponse.json({ ok: true, delivery: "stored" }, { status: 201 });
    }

    setEnquiryDeliveryStatus(enquiry.id, "sent");
    return NextResponse.json({ ok: true, delivery: "sent" }, { status: 201 });
  } catch {
    setEnquiryDeliveryStatus(enquiry.id, "failed");
    return NextResponse.json({ ok: true, delivery: "stored" }, { status: 201 });
  }
}
