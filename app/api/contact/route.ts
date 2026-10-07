import { NextResponse } from "next/server";

const projectTypes = new Set([
  "Production debugging",
  "Gameplay systems",
  "Vehicle systems",
  "UI / controller navigation",
  "Performance optimization",
]);

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

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !recipient) {
    return NextResponse.json({ error: "Contact delivery is not configured yet. Please email poggerscape3@gmail.com directly." }, { status: 503 });
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
      return NextResponse.json({ error: "Your message could not be sent. Please email poggerscape3@gmail.com directly." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Email delivery is temporarily unavailable. Please email poggerscape3@gmail.com directly." }, { status: 502 });
  }
}
