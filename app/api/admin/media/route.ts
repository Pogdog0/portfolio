import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isContentStoreWritable, saveMediaAsset } from "@/lib/content-store";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await isContentStoreWritable()) return NextResponse.json({ error: "Media uploads require persistent storage on this deployment." }, { status: 503 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (!allowed.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or GIF image." }, { status: 415 });
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Images must be smaller than 4 MB." }, { status: 413 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const validSignature = file.type === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
      : file.type === "image/png" ? bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        : file.type === "image/gif" ? bytes.subarray(0, 4).toString("ascii") === "GIF8"
          : bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
    if (!validSignature) return NextResponse.json({ error: "The uploaded file does not match its image type." }, { status: 415 });
    const asset = await saveMediaAsset({ name: file.name, mimeType: file.type, data: bytes });
    return NextResponse.json({ url: `/api/media/${asset.id}`, name: asset.name, size: asset.size });
  } catch (error) {
    console.error("Media upload failed", error);
    return NextResponse.json({ error: "The image could not be uploaded." }, { status: 500 });
  }
}
