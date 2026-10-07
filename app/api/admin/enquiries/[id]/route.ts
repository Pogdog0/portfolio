import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteEnquiry, updateEnquiryStatus } from "@/lib/content-store";
import type { EnquiryStatus } from "@/lib/content";

const statuses = new Set<EnquiryStatus>(["New", "Read", "Replied", "Archived"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json() as { status?: EnquiryStatus };
    if (!body.status || !statuses.has(body.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    if (!updateEnquiryStatus(id, body.status)) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update the enquiry." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!deleteEnquiry(id)) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
