import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import postgres from "postgres";
import { defaultContent, type Enquiry, type EnquiryStatus, type SiteContent } from "@/lib/content";

type PostgresClient = ReturnType<typeof postgres>;
type StoreGlobal = typeof globalThis & {
  __pogdogDatabase?: DatabaseSync;
  __pogdogPostgres?: PostgresClient;
  __pogdogPostgresSchema?: Promise<void>;
};

export type MediaAsset = {
  id: string;
  name: string;
  mimeType: string;
  data: Buffer;
  size: number;
  createdAt: string;
};

const storageMessage = "Persistent admin storage is not configured for this deployment. Use a Node.js host with a writable volume or connect an external database.";

function configuredDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || "file:./data/portfolio.db";
}

function usesFileStore() {
  return configuredDatabaseUrl().startsWith("file:");
}

function usesPostgresStore() {
  return /^postgres(?:ql)?:\/\//i.test(configuredDatabaseUrl());
}

function declaresReadOnlyRuntime() {
  return usesFileStore() && Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export async function isContentStoreWritable() {
  try {
    if (usesPostgresStore()) await getPostgres();
    else getDatabase();
    return true;
  } catch {
    return false;
  }
}

function databasePath() {
  const configured = configuredDatabaseUrl();
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
  if (declaresReadOnlyRuntime()) throw new Error(storageMessage);
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
    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      data BLOB NOT NULL,
      size INTEGER NOT NULL,
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

async function initializePostgres(sql: PostgresClient) {
  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      discord TEXT NOT NULL DEFAULT '',
      project_type TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      delivery_status TEXT NOT NULL DEFAULT 'stored',
      created_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      data BYTEA NOT NULL,
      size INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `;
  const now = new Date().toISOString();
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${JSON.stringify(defaultContent)}::jsonb, ${now})
    ON CONFLICT (id) DO NOTHING
  `;
}

async function getPostgres() {
  if (!usesPostgresStore()) throw new Error("DATABASE_URL must use a postgresql:// URL for the PostgreSQL content store.");
  const shared = globalThis as StoreGlobal;
  if (!shared.__pogdogPostgres) {
    shared.__pogdogPostgres = postgres(configuredDatabaseUrl(), {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  if (!shared.__pogdogPostgresSchema) {
    const setup = initializePostgres(shared.__pogdogPostgres).catch((error) => {
      shared.__pogdogPostgresSchema = undefined;
      throw error;
    });
    shared.__pogdogPostgresSchema = setup;
  }
  await shared.__pogdogPostgresSchema;
  return shared.__pogdogPostgres;
}

function hydratedContent(data: unknown): SiteContent {
  try {
    const parsed = (typeof data === "string" ? JSON.parse(data) : data) as Partial<SiteContent> | null;
    if (!parsed || typeof parsed !== "object") return structuredClone(defaultContent);
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

export async function getSiteContent(): Promise<SiteContent> {
  if (usesPostgresStore()) {
    const sql = await getPostgres();
    const [row] = await sql<{ data: unknown }[]>`SELECT data FROM site_content WHERE id = 1`;
    return hydratedContent(row?.data);
  }
  let row: { data?: string } | undefined;
  try {
    row = getDatabase().prepare("SELECT data FROM site_content WHERE id = 1").get() as { data?: string } | undefined;
  } catch (error) {
    if (usesFileStore()) return structuredClone(defaultContent);
    throw error;
  }
  return hydratedContent(row?.data);
}

export async function saveSiteContent(content: SiteContent) {
  const updatedAt = new Date().toISOString();
  if (usesPostgresStore()) {
    const sql = await getPostgres();
    await sql`
      INSERT INTO site_content (id, data, updated_at)
      VALUES (1, ${JSON.stringify(content)}::jsonb, ${updatedAt})
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
    `;
    return updatedAt;
  }
  getDatabase().prepare("UPDATE site_content SET data = ?, updated_at = ? WHERE id = 1")
    .run(JSON.stringify(content), updatedAt);
  return updatedAt;
}

export async function listEnquiries(): Promise<Enquiry[]> {
  if (usesPostgresStore()) {
    const sql = await getPostgres();
    const rows = await sql<Array<{
      id: string;
      name: string;
      email: string;
      discord: string;
      project_type: string;
      description: string;
      status: string;
      delivery_status: string;
      created_at: Date | string;
    }>>`
      SELECT id, name, email, discord, project_type, description, status, delivery_status, created_at
      FROM enquiries ORDER BY created_at DESC
    `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      discord: row.discord,
      projectType: row.project_type,
      description: row.description,
      status: row.status as EnquiryStatus,
      deliveryStatus: row.delivery_status as Enquiry["deliveryStatus"],
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    }));
  }
  let rows: Array<Record<string, string>>;
  try {
    rows = getDatabase().prepare(`
      SELECT id, name, email, discord, project_type, description, status, delivery_status, created_at
      FROM enquiries ORDER BY created_at DESC
    `).all() as Array<Record<string, string>>;
  } catch (error) {
    if (usesFileStore()) return [];
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

export async function createEnquiry(input: Omit<Enquiry, "id" | "status" | "deliveryStatus" | "createdAt">) {
  const enquiry: Enquiry = {
    ...input,
    id: crypto.randomUUID(),
    status: "New",
    deliveryStatus: "stored",
    createdAt: new Date().toISOString(),
  };
  if (usesPostgresStore()) {
    const sql = await getPostgres();
    await sql`
      INSERT INTO enquiries (id, name, email, discord, project_type, description, status, delivery_status, created_at)
      VALUES (${enquiry.id}, ${enquiry.name}, ${enquiry.email}, ${enquiry.discord}, ${enquiry.projectType}, ${enquiry.description}, ${enquiry.status}, ${enquiry.deliveryStatus}, ${enquiry.createdAt})
    `;
    return enquiry;
  }
  getDatabase().prepare(`
    INSERT INTO enquiries (id, name, email, discord, project_type, description, status, delivery_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(enquiry.id, enquiry.name, enquiry.email, enquiry.discord, enquiry.projectType, enquiry.description, enquiry.status, enquiry.deliveryStatus, enquiry.createdAt);
  return enquiry;
}

export async function setEnquiryDeliveryStatus(id: string, status: Enquiry["deliveryStatus"]) {
  if (usesPostgresStore()) {
    const sql = await getPostgres();
    await sql`UPDATE enquiries SET delivery_status = ${status} WHERE id = ${id}`;
    return;
  }
  getDatabase().prepare("UPDATE enquiries SET delivery_status = ? WHERE id = ?").run(status, id);
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  if (usesPostgresStore()) {
    const sql = await getPostgres();
    const result = await sql`UPDATE enquiries SET status = ${status} WHERE id = ${id}`;
    return result.count > 0;
  }
  const result = getDatabase().prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, id);
  return result.changes > 0;
}

export async function deleteEnquiry(id: string) {
  if (usesPostgresStore()) {
    const sql = await getPostgres();
    const result = await sql`DELETE FROM enquiries WHERE id = ${id}`;
    return result.count > 0;
  }
  const result = getDatabase().prepare("DELETE FROM enquiries WHERE id = ?").run(id);
  return result.changes > 0;
}

export async function saveMediaAsset(input: { name: string; mimeType: string; data: Buffer }) {
  const asset: MediaAsset = {
    id: crypto.randomUUID(),
    name: input.name,
    mimeType: input.mimeType,
    data: input.data,
    size: input.data.byteLength,
    createdAt: new Date().toISOString(),
  };
  if (usesPostgresStore()) {
    const sql = await getPostgres();
    await sql`
      INSERT INTO media_assets (id, name, mime_type, data, size, created_at)
      VALUES (${asset.id}, ${asset.name}, ${asset.mimeType}, ${asset.data}, ${asset.size}, ${asset.createdAt})
    `;
    return asset;
  }
  getDatabase().prepare(`
    INSERT INTO media_assets (id, name, mime_type, data, size, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(asset.id, asset.name, asset.mimeType, asset.data, asset.size, asset.createdAt);
  return asset;
}

export async function getMediaAsset(id: string): Promise<MediaAsset | null> {
  if (usesPostgresStore()) {
    const sql = await getPostgres();
    const [row] = await sql<Array<{
      id: string;
      name: string;
      mime_type: string;
      data: Uint8Array;
      size: number;
      created_at: Date | string;
    }>>`
      SELECT id, name, mime_type, data, size, created_at FROM media_assets WHERE id = ${id}
    `;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      mimeType: row.mime_type,
      data: Buffer.from(row.data),
      size: row.size,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    };
  }
  const row = getDatabase().prepare(`
    SELECT id, name, mime_type, data, size, created_at FROM media_assets WHERE id = ?
  `).get(id) as { id: string; name: string; mime_type: string; data: Uint8Array; size: number; created_at: string } | undefined;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    mimeType: row.mime_type,
    data: Buffer.from(row.data),
    size: row.size,
    createdAt: row.created_at,
  };
}
