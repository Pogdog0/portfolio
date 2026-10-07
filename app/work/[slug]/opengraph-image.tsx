import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import SocialCard from "@/components/SocialCard";
import { defaultContent } from "@/lib/content";
import { getSiteContent } from "@/lib/content-store";

export const alt = "Pogdog Roblox project case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function projectImageSource(image: string) {
  if (/^\/images\/[a-z0-9/_-]+\.(?:jpe?g|png|webp|gif)$/i.test(image)) {
    const data = await readFile(join(process.cwd(), "public", image.replace(/^\/+/, "")));
    const converted = await sharp(data).resize(size.width, size.height, { fit: "cover" }).png().toBuffer();
    return `data:image/png;base64,${converted.toString("base64")}`;
  }
  if (/^https?:\/\//i.test(image)) return image;
  return new URL(image, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString();
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = content.projects.find((item) => item.slug === slug) ?? defaultContent.projects[0];
  const imageSrc = await projectImageSource(project.image);
  return new ImageResponse(
    <SocialCard
      eyebrow={`${project.category} / Case study`}
      title={project.title.toUpperCase()}
      summary={project.result || project.description || "Roblox production engineering case study."}
      imageSrc={imageSrc}
      accent={project.accent}
      tags={project.tags}
    />,
    size,
  );
}
