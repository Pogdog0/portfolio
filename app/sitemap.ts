import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const projects = getSiteContent().projects.filter((project) => project.status === "Published" && project.caseStudy.intro);
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    ...projects.map((project) => ({ url: `${baseUrl}/work/${project.slug}`, lastModified: new Date(project.updatedAt), changeFrequency: "monthly" as const, priority: .6 })),
  ];
}
