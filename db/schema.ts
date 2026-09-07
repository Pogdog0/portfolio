import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = (name: string) => text(name).primaryKey().$defaultFn(() => crypto.randomUUID());

export const adminUsers = sqliteTable("admin_users", {
  id: id("id"), email: text("email").notNull().unique(), passwordHash: text("password_hash").notNull(), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
});

export const projects = sqliteTable("projects", {
  id: id("id"), slug: text("slug").notNull().unique(), title: text("title").notNull(), subtitle: text("subtitle"), description: text("description").notNull(), role: text("role"), period: text("period"), robloxUrl: text("roblox_url"), category: text("category").notNull(), status: text("status").notNull().default("draft"), featured: integer("featured", { mode: "boolean" }).notNull().default(false), confidentiality: text("confidentiality").notNull().default("public"), credits: text("credits"), displayOrder: integer("display_order").notNull().default(0), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const projectMedia = sqliteTable("project_media", {
  id: id("id"), projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }), assetId: text("asset_id").notNull(), kind: text("kind").notNull(), caption: text("caption"), displayOrder: integer("display_order").notNull().default(0),
});

export const projectSections = sqliteTable("project_sections", {
  id: id("id"), projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }), blockType: text("block_type").notNull(), payload: text("payload", { mode: "json" }).notNull(), displayOrder: integer("display_order").notNull().default(0),
});

export const projectMetrics = sqliteTable("project_metrics", {
  id: id("id"), projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }), label: text("label").notNull(), value: text("value").notNull(), description: text("description"), verified: integer("verified", { mode: "boolean" }).notNull().default(false), displayOrder: integer("display_order").notNull().default(0),
});

export const services = sqliteTable("services", {
  id: id("id"), title: text("title").notNull(), shortDescription: text("short_description").notNull(), detailedDescription: text("detailed_description"), icon: text("icon"), featured: integer("featured", { mode: "boolean" }).notNull().default(false), visible: integer("visible", { mode: "boolean" }).notNull().default(true), displayOrder: integer("display_order").notNull().default(0),
});

export const skills = sqliteTable("skills", {
  id: id("id"), title: text("title").notNull(), category: text("category"), experienceLabel: text("experience_label"), visible: integer("visible", { mode: "boolean" }).notNull().default(true), displayOrder: integer("display_order").notNull().default(0),
});

export const testimonials = sqliteTable("testimonials", {
  id: id("id"), clientName: text("client_name").notNull(), role: text("role"), studio: text("studio"), avatarAssetId: text("avatar_asset_id"), quote: text("quote").notNull(), projectId: text("project_id").references(() => projects.id), featured: integer("featured", { mode: "boolean" }).notNull().default(false), visible: integer("visible", { mode: "boolean" }).notNull().default(true), displayOrder: integer("display_order").notNull().default(0),
});

export const siteMetrics = sqliteTable("site_metrics", {
  id: id("id"), internalName: text("internal_name").notNull(), publicLabel: text("public_label").notNull(), number: text("number").notNull(), prefix: text("prefix"), suffix: text("suffix"), description: text("description"), category: text("category"), verificationNote: text("verification_note"), visible: integer("visible", { mode: "boolean" }).notNull().default(true), displayOrder: integer("display_order").notNull().default(0),
});

export const contactEnquiries = sqliteTable("contact_enquiries", {
  id: id("id"), name: text("name").notNull(), discord: text("discord"), email: text("email").notNull(), projectType: text("project_type"), budgetRange: text("budget_range"), description: text("description").notNull(), deadline: text("deadline"), gameLink: text("game_link"), attachmentAssetId: text("attachment_asset_id"), preferredContact: text("preferred_contact"), honeypot: text("honeypot"), status: text("status").notNull().default("unread"), privateNotes: text("private_notes"), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const socialLinks = sqliteTable("social_links", {
  id: id("id"), label: text("label").notNull(), url: text("url").notNull(), icon: text("icon"), displayOrder: integer("display_order").notNull().default(0), visible: integer("visible", { mode: "boolean" }).notNull().default(true),
});

export const siteSettings = sqliteTable("site_settings", {
  id: id("id"), key: text("key").notNull().unique(), value: text("value", { mode: "json" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const mediaAssets = sqliteTable("media_assets", {
  id: id("id"), name: text("name").notNull(), url: text("url").notNull(), kind: text("kind").notNull(), mimeType: text("mime_type"), altText: text("alt_text"), caption: text("caption"), sizeBytes: integer("size_bytes"), width: integer("width"), height: integer("height"), durationSeconds: integer("duration_seconds"), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: id("id"), action: text("action").notNull(), entityType: text("entity_type"), entityId: text("entity_id"), metadata: text("metadata", { mode: "json" }), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const schema = { adminUsers, projects, projectMedia, projectSections, projectMetrics, services, skills, testimonials, siteMetrics, contactEnquiries, socialLinks, siteSettings, mediaAssets, activityLogs };
