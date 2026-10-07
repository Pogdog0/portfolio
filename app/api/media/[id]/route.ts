import { NextResponse } from "next/server";
import { getMediaAsset } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Media not found." }, { status: 404 });
  const asset = await getMediaAsset(id);
  if (!asset) return NextResponse.json({ error: "Media not found." }, { status: 404 });
  return new NextResponse(new Uint8Array(asset.data), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(asset.size),
      "Content-Type": asset.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
