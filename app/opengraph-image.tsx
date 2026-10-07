import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import SocialCard from "@/components/SocialCard";

export const alt = "Pogdog - Roblox gameplay systems engineer portfolio card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const heroData = await readFile(join(process.cwd(), "public", "images", "social", "pogdog-studio-v1.png"));
const heroPng = await sharp(heroData).resize(size.width, size.height, { fit: "cover" }).png().toBuffer();
const heroSrc = `data:image/png;base64,${heroPng.toString("base64")}`;

export default function Image() {
  return new ImageResponse(
    <SocialCard
      eyebrow="Roblox gameplay systems engineer"
      title="POGDOG"
      summary="Production debugging, gameplay systems, vehicles, and live-game performance."
      imageSrc={heroSrc}
    />,
    size,
  );
}
