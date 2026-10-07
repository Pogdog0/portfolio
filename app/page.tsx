import Portfolio from "@/components/Portfolio";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default function Home() {
  const content = getSiteContent();
  return <Portfolio content={{ ...content, projects: content.projects.filter((project) => project.status === "Published"), media: [] }} />;
}
