export type PublishStatus = "Published" | "Draft";

export type CaseStudyContent = {
  intro: string;
  problem: string;
  investigation: string;
  solution: string;
  result: string;
  scope: string;
  lead: string;
};

export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  role: string;
  period: string;
  result: string;
  accent: string;
  videoUrl: string;
  status: PublishStatus;
  featured: boolean;
  order: number;
  updatedAt: string;
  caseStudy: CaseStudyContent;
};

export type Metric = { id: string; value: string; label: string; note: string };
export type Service = { id: string; title: string; copy: string };
export type Skill = { id: string; title: string; type: string };
export type WorkflowStep = { id: string; title: string; copy: string };
export type MediaAsset = { id: string; url: string; name: string; size: number; createdAt: string };

export type SiteContent = {
  projects: PortfolioProject[];
  metrics: Metric[];
  services: Service[];
  skills: Skill[];
  workflow: WorkflowStep[];
  media: MediaAsset[];
  principle: { headline: string; accent: string; body: string };
  settings: {
    availability: string;
    announcement: string;
    contactEmail: string;
    location: string;
    responseTime: string;
    seoTitle: string;
    seoDescription: string;
  };
};

export type EnquiryStatus = "New" | "Read" | "Replied" | "Archived";

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  discord: string;
  projectType: string;
  description: string;
  status: EnquiryStatus;
  deliveryStatus: "sent" | "stored" | "failed";
  createdAt: string;
};

const project = (
  id: string,
  title: string,
  slug: string,
  category: string,
  image: string,
  order: number,
  values: Partial<PortfolioProject>,
): PortfolioProject => ({
  id,
  slug,
  title,
  eyebrow: `${category} / ${String(order + 1).padStart(2, "0")}`,
  description: "",
  image,
  category,
  tags: [],
  role: "",
  period: "",
  result: "",
  accent: "#55a8ff",
  videoUrl: "",
  status: "Published",
  featured: false,
  order,
  updatedAt: "2026-10-08T00:00:00.000Z",
  caseStudy: { intro: "", problem: "", investigation: "", solution: "", result: "", scope: "", lead: "" },
  ...values,
});

export const defaultContent: SiteContent = {
  projects: [
    project("tower-defense", "Tower Defense", "tower-defense", "Gameplay Systems", "/images/projects/tower-defense.webp", 0, {
      eyebrow: "Gameplay systems / 01",
      description: "Wave logic, progression, and readable systems built for repeatable play.",
      tags: ["Luau", "Progression", "Systems"],
      result: "Repeatable wave logic and progression systems.",
    }),
    project("pvp", "PvP", "pvp", "Gameplay Systems", "/images/projects/pvp.webp", 1, {
      eyebrow: "Combat systems / 02",
      description: "Responsive round flow, player states, and combat interactions that stay predictable.",
      tags: ["Combat", "State", "Client-server"],
      result: "Predictable combat interactions and round flow.",
      accent: "#9fd4ff",
    }),
    project("tycoon", "Tycoon", "tycoon", "Gameplay Systems", "/images/projects/tycoon.webp", 2, {
      eyebrow: "Progression / 03",
      description: "Upgrade paths, interaction logic, and progression that players can understand at a glance.",
      tags: ["Tycoon", "UI", "DataStores"],
      result: "Clear upgrade paths and readable progression.",
      accent: "#d9ecff",
    }),
    project("car-kits", "Car Kits", "car-kits", "Vehicle Systems", "/images/projects/car-kits.webp", 3, {
      eyebrow: "Vehicle systems / 04",
      description: "Vehicle foundations, tuning touchpoints, and the practical details that make cars feel right.",
      tags: ["Vehicles", "Tuning", "A-Chassis"],
      result: "Vehicle foundations, tuning, and handling work.",
      accent: "#73c7ff",
    }),
    project("coin-collection", "Coin Collection", "coin-collection", "Personal Projects", "/images/projects/coin-collection.webp", 4, {
      eyebrow: "Interaction loop / 05",
      description: "Collection feedback, interaction flow, and persistence touchpoints without unnecessary complexity.",
      tags: ["Interaction", "Feedback", "Persistence"],
      result: "A clear collection loop with feedback and persistence.",
      accent: "#b09af5",
    }),
    project("featured-project", "West Indies", "featured-project", "Production Work", "/images/projects/west-indies.webp", 5, {
      eyebrow: "Live production work / 06",
      description: "DataStore recovery under live load: throttling, data loss, and persistence fixes.",
      tags: ["DataStores", "Throttling", "Recovery"],
      role: "Gameplay Systems Developer",
      period: "1-week recovery sprint",
      result: "Stable saving for large player data at 500 CCU every day.",
      accent: "#70d6ff",
      featured: true,
      caseStudy: {
        intro: "West Indies was losing player data and hitting heavy DataStore throttling under live conditions.",
        problem: "The game had frequent throttling and data loss problems. Large player-data payloads were not reliably completing their save path.",
        investigation: "My team and I traced the write flow, retry behavior, payload pressure, and failure cases across live sessions.",
        solution: "We applied targeted persistence and recovery fixes, tightening the save path without rewriting the whole game.",
        result: "In one week, the game reached stable saving for enormous amounts of data with 500 CCU players every day.",
        scope: "DataStores / Recovery / Live stability",
        lead: "Reliable persistence is a gameplay feature.",
      },
    }),
  ],
  metrics: [
    { id: "years", value: "5+", label: "Years on Roblox Studio", note: "Building and maintaining Roblox systems" },
    { id: "earned", value: "700K+", label: "Robux earned", note: "Across Roblox development work" },
    { id: "commission", value: "300K", label: "Largest commission", note: "Single project payment" },
    { id: "codebases", value: "∞", label: "Messy codebases welcome", note: "Root cause over rewrite" },
  ],
  services: [
    { id: "production-fixes", title: "Production bug fixing", copy: "Race conditions, state problems, UI conflicts, and failures in live games." },
    { id: "existing-code", title: "Existing codebase work", copy: "Understand what is there, preserve what works, and change only what needs changing." },
    { id: "gameplay", title: "Gameplay systems", copy: "Shops, inventories, progression, minigames, and custom mechanics." },
    { id: "vehicles", title: "Vehicle development", copy: "A-Chassis, tuning, customization, spawning, and controller support." },
    { id: "performance", title: "Performance optimization", copy: "Profile scripts, reduce expensive loops, and improve replication." },
    { id: "ui", title: "UI engineering", copy: "Responsive Roblox UI, gamepad navigation, and production-ready interaction." },
  ],
  skills: [
    { id: "luau", title: "Luau", type: "Daily driver" },
    { id: "studio", title: "Roblox Studio", type: "Production" },
    { id: "architecture", title: "Client-server architecture", type: "Systems" },
    { id: "datastores", title: "DataStores / ProfileStore", type: "Persistence" },
    { id: "networking", title: "RemoteEvents / Functions", type: "Networking" },
    { id: "gamepad", title: "Gamepad navigation", type: "UI" },
    { id: "chassis", title: "A-Chassis / vehicle tuning", type: "Vehicles" },
    { id: "profiling", title: "Performance profiling", type: "Optimization" },
    { id: "workflow", title: "Rojo / Git / GitHub", type: "Workflow" },
  ],
  workflow: [
    { id: "understand", title: "Understand", copy: "Map the system." },
    { id: "reproduce", title: "Reproduce", copy: "Make the issue repeatable." },
    { id: "locate", title: "Locate", copy: "Trace the root cause." },
    { id: "plan", title: "Plan", copy: "Choose the safest change." },
    { id: "ship", title: "Ship", copy: "Test, document, deliver." },
  ],
  media: [
    { id: "media-tower-defense", url: "/images/projects/tower-defense.webp", name: "Tower Defense", size: 0, createdAt: "2026-10-08T00:00:00.000Z" },
    { id: "media-pvp", url: "/images/projects/pvp.webp", name: "PvP", size: 0, createdAt: "2026-10-08T00:00:00.000Z" },
    { id: "media-tycoon", url: "/images/projects/tycoon.webp", name: "Tycoon", size: 0, createdAt: "2026-10-08T00:00:00.000Z" },
    { id: "media-car-kits", url: "/images/projects/car-kits.webp", name: "Car Kits", size: 0, createdAt: "2026-10-08T00:00:00.000Z" },
    { id: "media-coin-collection", url: "/images/projects/coin-collection.webp", name: "Coin Collection", size: 0, createdAt: "2026-10-08T00:00:00.000Z" },
    { id: "media-west-indies", url: "/images/projects/west-indies.webp", name: "West Indies", size: 0, createdAt: "2026-10-08T00:00:00.000Z" },
  ],
  principle: {
    headline: "Fix the real problem.",
    accent: "Keep what works.",
    body: "I enter existing projects, find the root cause, and ship the smallest fix that holds.",
  },
  settings: {
    availability: "Available for select production work",
    announcement: "",
    contactEmail: "poggerscape3@gmail.com",
    location: "IST / UTC+05:30 · Remote",
    responseTime: "Replies in 1–2 business days",
    seoTitle: "Pogdog — Roblox Gameplay Systems Engineer",
    seoDescription: "Production debugging, gameplay systems, optimization, vehicles, and live-game maintenance.",
  },
};

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
