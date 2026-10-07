import { ImageResponse } from "next/og";
import SocialCard from "@/components/SocialCard";

export const alt = "Pogdog - Roblox gameplay systems engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <SocialCard
      eyebrow="Production engineering"
      title="I FIX THE SYSTEMS PLAYERS FEEL."
      summary="Production debugging, gameplay systems, vehicles, and performance for Roblox experiences."
    />,
    size,
  );
}
