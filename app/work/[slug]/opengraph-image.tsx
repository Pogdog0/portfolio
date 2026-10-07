import { ImageResponse } from "next/og";
import SocialCard from "@/components/SocialCard";
import { defaultContent } from "@/lib/content";
import { getSiteContent } from "@/lib/content-store";

export const alt = "Pogdog Roblox project case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = content.projects.find((item) => item.slug === slug) ?? defaultContent.projects[0];
  return new ImageResponse(
    <SocialCard
      eyebrow={`Case study / ${project.category}`}
      title={project.title.toUpperCase()}
      summary={project.result || project.description || "Roblox production engineering case study."}
      accent={project.accent}
      tags={project.tags}
    />,
    size,
  );
}
