import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { defaultContent, type Enquiry, type EnquiryStatus, type SiteContent } from "@/lib/content";

type StoreGlobal = typeof globalThis & { __pogdogDatabase?: DatabaseSync };

const storageMessage = "Persistent admin storage is not configured for this deployment. Use a Node.js host with a writable volume or connect an external database.";

export function isContentStoreWritable() {
  const configured = process.env.DATABASE_URL?.trim() || "file:./data/portfolio.db";
  return !(process.env.VERCEL && configured.startsWith("file:"));
}

function databasePath() {
  const configured = process.env.DATABASE_URL?.trim() || "file:./data/portfolio.db";
  if (!configured.startsWith("file:")) {
    throw new Error("DATABASE_URL must use a file: URL for the built-in SQLite content store.");
  }
  let filename = decodeURIComponent(configured.slice(5).split("?")[0]);
  if (filename.startsWith("///") && /^[A-Za-z]:/.test(filename.slice(3))) filename = filename.slice(3);
  if (!filename) filename = "./data/portfolio.db";
  const resolved = path.isAbsolute(filename) ? filename : path.resolve(process.cwd(), filename);
  mkdirSync(path.dirname(resolved), { recursive: true });
  return resolved;
}

function getDatabase() {
  if (!isContentStoreWritable()) throw new Error(storageMessage);
  const shared = globalThis as StoreGlobal;
  if (shared.__pogdogDatabase) return shared.__pogdogDatabase;
  const db = new DatabaseSync(databasePath());
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      discord TEXT NOT NULL DEFAULT '',
      project_type TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      delivery_status TEXT NOT NULL DEFAULT 'stored',
      created_at TEXT NOT NULL
    );
  `);
  const existing = db.prepare("SELECT id FROM site_content WHERE id = 1").get();
  if (!existing) {
    db.prepare("INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, ?)")
      .run(JSON.stringify(defaultContent), new Date().toISOString());
  }
  shared.__pogdogDatabase = db;
  return db;
}

export function getSiteContent(): SiteContent {
  let row: { data?: string } | undefined;
  try {
    row = getDatabase().prepare("SELECT data FROM site_content WHERE id = 1").get() as { data?: string } | undefined;
  } catch (error) {
    if (process.env.VERCEL) return structuredClone(defaultContent);
    throw error;
  }
  if (!row?.data) return structuredClone(defaultContent);
  try {
    const parsed = JSON.parse(row.data) as Partial<SiteContent>;
    return {
      ...structuredClone(defaultContent),
      ...parsed,
      settings: { ...defaultContent.settings, ...parsed.settings },
      principle: { ...defaultContent.principle, ...parsed.principle },
    };
  } catch {
    return structuredClone(defaultContent);
  }
}

export function saveSiteContent(content: SiteContent) {
  const updatedAt = new Date().toISOString();
  getDatabase().prepare("UPDATE site_content SET data = ?, updated_at = ? WHERE id = 1")
    .run(JSON.stringify(content), updatedAt);
  return updatedAt;
}

export function listEnquiries(): Enquiry[] {
  let rows: Array<Record<string, string>>;
  try {
    rows = getDatabase().prepare(`
      SELECT id, name, email, discord, project_type, description, status, delivery_status, created_at
      FROM enquiries ORDER BY created_at DESC
    `).all() as Array<Record<string, string>>;
  } catch (error) {
    if (process.env.VERCEL) return [];
    throw error;
  }
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    discord: row.discord,
    projectType: row.project_type,
    description: row.description,
    status: row.status as EnquiryStatus,
    deliveryStatus: row.delivery_status as Enquiry["deliveryStatus"],
    createdAt: row.created_at,
  }));
}

export function createEnquiry(input: Omit<Enquiry, "id" | "status" | "deliveryStatus" | "createdAt">) {
  const enquiry: Enquiry = {
    ...input,
    id: crypto.randomUUID(),
    status: "New",
    deliveryStatus: "stored",
    createdAt: new Date().toISOString(),
  };
  getDatabase().prepare(`
    INSERT INTO enquiries (id, name, email, discord, project_type, description, status, delivery_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(enquiry.id, enquiry.name, enquiry.email, enquiry.discord, enquiry.projectType, enquiry.description, enquiry.status, enquiry.deliveryStatus, enquiry.createdAt);
  return enquiry;
}

export function setEnquiryDeliveryStatus(id: string, status: Enquiry["deliveryStatus"]) {
  getDatabase().prepare("UPDATE enquiries SET delivery_status = ? WHERE id = ?").run(status, id);
}

export function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  const result = getDatabase().prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, id);
  return result.changes > 0;
}

export function deleteEnquiry(id: string) {
  const result = getDatabase().prepare("DELETE FROM enquiries WHERE id = ?").run(id);
  return result.changes > 0;
}
