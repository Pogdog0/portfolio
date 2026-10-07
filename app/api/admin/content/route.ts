import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSiteContent, listEnquiries, saveSiteContent } from "@/lib/content-store";
import type { PortfolioProject, SiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

function text(value: unknown, max: number, required = true) {
  if (typeof value !== "string") throw new Error("A text field is invalid.");
  const result = value.trim().slice(0, max);
  if (required && !result) throw new Error("A required field is empty.");
  return result;
}

function items(value: unknown, max: number) {
  if (!Array.isArray(value) || value.length > max) throw new Error("A content list is invalid.");
  return value;
}

function safeUrl(value: unknown, max = 500) {
  const result = text(value, max, false);
  if (!result || result.startsWith("/")) return result;
  const url = new URL(result);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("A URL is invalid.");
  return result;
}

function normalizeProject(value: unknown, index: number): PortfolioProject {
  if (!value || typeof value !== "object") throw new Error("A project is invalid.");
  const project = value as Record<string, unknown>;
  const caseStudy = project.caseStudy && typeof project.caseStudy === "object" ? project.caseStudy as Record<string, unknown> : {};
  const slug = text(project.slug, 80).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("Every project needs a valid URL slug.");
  const accent = text(project.accent, 20, false);
  return {
    id: text(project.id, 100),
    slug,
    title: text(project.title, 120),
    eyebrow: text(project.eyebrow, 140),
    description: text(project.description, 800),
    image: safeUrl(project.image),
    category: text(project.category, 80),
    tags: items(project.tags, 12).map((tag) => text(tag, 40)),
    role: text(project.role, 120, false),
    period: text(project.period, 120, false),
    result: text(project.result, 500, false),
    accent: /^#[0-9a-f]{6}$/i.test(accent) ? accent : "#55a8ff",
    videoUrl: safeUrl(project.videoUrl),
    status: project.status === "Draft" ? "Draft" : "Published",
    featured: Boolean(project.featured),
    order: index,
    updatedAt: new Date().toISOString(),
    caseStudy: {
      intro: text(caseStudy.intro ?? "", 1200, false),
      problem: text(caseStudy.problem ?? "", 3000, false),
      investigation: text(caseStudy.investigation ?? "", 3000, false),
      solution: text(caseStudy.solution ?? "", 3000, false),
      result: text(caseStudy.result ?? "", 3000, false),
      scope: text(caseStudy.scope ?? "", 300, false),
      lead: text(caseStudy.lead ?? "", 300, false),
    },
  };
}

function normalizeContent(value: unknown): SiteContent {
  if (!value || typeof value !== "object") throw new Error("The content payload is invalid.");
  const input = value as Record<string, unknown>;
  const projects = items(input.projects, 100).map(normalizeProject);
  if (new Set(projects.map((project) => project.slug)).size !== projects.length) throw new Error("Project slugs must be unique.");
  if (new Set(projects.map((project) => project.id)).size !== projects.length) throw new Error("Project identifiers must be unique.");
  const normalizeRows = (value: unknown, max: number, fields: Array<[string, number]>) => items(value, max).map((row, index) => {
    if (!row || typeof row !== "object") throw new Error("A content row is invalid.");
    const record = row as Record<string, unknown>;
    return Object.fromEntries([["id", text(record.id || `row-${index}`, 100)], ...fields.map(([field, limit]) => [field, text(record[field], limit)])]);
  });
  if (!input.principle || typeof input.principle !== "object" || !input.settings || typeof input.settings !== "object") throw new Error("Settings are invalid.");
  const principle = input.principle as Record<string, unknown>;
  const settings = input.settings as Record<string, unknown>;
  const contactEmail = text(settings.contactEmail, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) throw new Error("The contact email is invalid.");
  return {
    projects,
    metrics: normalizeRows(input.metrics, 12, [["value", 30], ["label", 120], ["note", 240]]) as SiteContent["metrics"],
    services: normalizeRows(input.services, 20, [["title", 120], ["copy", 500]]) as SiteContent["services"],
    skills: normalizeRows(input.skills, 30, [["title", 120], ["type", 100]]) as SiteContent["skills"],
    workflow: normalizeRows(input.workflow, 12, [["title", 100], ["copy", 300]]) as SiteContent["workflow"],
    media: items(input.media, 250).map((asset, index) => {
      if (!asset || typeof asset !== "object") throw new Error("A media record is invalid.");
      const record = asset as Record<string, unknown>;
      return {
        id: text(record.id || `media-${index}`, 100),
        url: safeUrl(record.url),
        name: text(record.name, 160),
        size: typeof record.size === "number" && Number.isFinite(record.size) ? Math.max(0, Math.round(record.size)) : 0,
        createdAt: text(record.createdAt || new Date().toISOString(), 40),
      };
    }),
    principle: {
      headline: text(principle.headline, 180),
      accent: text(principle.accent, 180),
      body: text(principle.body, 500),
    },
    settings: {
      availability: text(settings.availability, 160),
      announcement: text(settings.announcement, 300, false),
      contactEmail,
      location: text(settings.location, 120),
      responseTime: text(settings.responseTime, 120),
      seoTitle: text(settings.seoTitle, 120),
      seoDescription: text(settings.seoDescription, 300),
    },
  };
}

export async function GET() {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ content: getSiteContent(), enquiries: listEnquiries() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 300_000) return NextResponse.json({ error: "The update is too large." }, { status: 413 });
  try {
    const body = await request.json() as { content?: unknown };
    const content = normalizeContent(body.content);
    const updatedAt = saveSiteContent(content);
    return NextResponse.json({ content, updatedAt });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save content." }, { status: 400 });
  }
}
