import * as schema from "./schema";

export { schema };

/**
 * The portfolio currently runs without database reads so it can deploy cleanly
 * to Vercel. Replace this adapter with a Vercel Postgres/Neon or D1 adapter
 * when the admin CRUD actions are connected to persistent storage.
 */
export function getDb(): never {
  throw new Error("Database adapter not configured. Connect the schema to your production database before enabling CRUD writes.");
}
