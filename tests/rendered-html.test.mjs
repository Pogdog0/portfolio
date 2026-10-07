import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import { pbkdf2Sync } from "node:crypto";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
let server;
let baseUrl;
let testDirectory;

const adminEmail = "qa@example.com";
const adminPassword = "portfolio-test-password";
const salt = Buffer.from("pogdog-test-salt");
const passwordHash = `pbkdf2:100000:${salt.toString("base64url")}:${pbkdf2Sync(adminPassword, salt, 100_000, 32, "sha256").toString("base64url")}`;
const authSecret = "test-only-auth-secret-with-more-than-thirty-two-characters";

async function getFreePort() {
  const listener = createServer();
  await new Promise((resolve, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", resolve);
  });
  const { port } = listener.address();
  await new Promise((resolve, reject) => listener.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Next.js exited with code ${server.exitCode}`);
    try {
      await fetch(baseUrl);
      return;
    } catch {
      await delay(500);
    }
  }
  throw new Error("Next.js did not start within 30 seconds");
}

before(async () => {
  testDirectory = mkdtempSync(join(tmpdir(), "pogdog-portfolio-"));
  const port = await getFreePort();
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      ADMIN_EMAIL: adminEmail,
      ADMIN_PASSWORD_HASH: passwordHash,
      AUTH_SECRET: authSecret,
      DATABASE_URL: `file:${join(testDirectory, "content.db")}`,
      RESEND_API_KEY: "",
      CONTACT_TO_EMAIL: "",
    },
    stdio: "ignore",
  });
  await waitForServer();
});

after(async () => {
  if (server && server.exitCode === null) {
    server.kill();
    await once(server, "exit");
  }
  if (testDirectory) rmSync(testDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

async function render(path = "/") {
  return fetch(new URL(path, baseUrl), { headers: { accept: "text/html" } });
}

test("server-renders the portfolio homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Pogdog/i);
  assert.match(html, /Roblox/i);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
  const socialImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  assert.ok(socialImage);
  const imageMetadataUrl = new URL(socialImage.replaceAll("&amp;", "&"));
  const imageResponse = await fetch(new URL(`${imageMetadataUrl.pathname}${imageMetadataUrl.search}`, baseUrl));
  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get("content-type"), "image/png");
  assert.deepEqual(Buffer.from(await imageResponse.arrayBuffer()).subarray(0, 8), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
});

test("server-renders protected-area surfaces and the case study route", async () => {
  const [admin, login, caseStudy] = await Promise.all([
    fetch(new URL("/admin", baseUrl), { headers: { accept: "text/html" }, redirect: "manual" }),
    render("/admin/login"),
    render("/work/featured-project"),
  ]);
  assert.equal(admin.status, 307);
  assert.match(admin.headers.get("location") ?? "", /\/admin\/login/);
  assert.equal(login.status, 200);
  assert.equal(caseStudy.status, 200);
  assert.match(await login.text(), /Welcome back/i);
  const caseStudyHtml = await caseStudy.text();
  assert.match(caseStudyHtml, /What was happening|Featured Project/i);
  assert.match(caseStudyHtml, /<meta property="og:title" content="West Indies - Roblox case study \| Pogdog"/);
  assert.match(caseStudyHtml, /<meta property="og:image" content="[^"]+\/work\/featured-project\/opengraph-image/);
  const projectSocialImage = caseStudyHtml.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  assert.ok(projectSocialImage);
  const projectImageMetadataUrl = new URL(projectSocialImage.replaceAll("&amp;", "&"));
  const projectImageResponse = await fetch(new URL(`${projectImageMetadataUrl.pathname}${projectImageMetadataUrl.search}`, baseUrl));
  assert.equal(projectImageResponse.status, 200);
  assert.equal(projectImageResponse.headers.get("content-type"), "image/png");
});

test("admin authentication, content publishing, enquiries, and media work end to end", async () => {
  const rejected = await fetch(new URL("/api/auth/login", baseUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: "wrong-password" }),
  });
  assert.equal(rejected.status, 401);

  const login = await fetch(new URL("/api/auth/login", baseUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie")?.split(";", 1)[0];
  assert.ok(cookie?.startsWith("pogdog_admin_session="));

  const admin = await fetch(new URL("/api/admin/content", baseUrl), { headers: { cookie } });
  assert.equal(admin.status, 200);
  const initial = await admin.json();
  assert.equal(initial.content.projects.length, 6);

  const announcement = "Automated dashboard QA is live";
  const updatedContent = {
    ...initial.content,
    settings: { ...initial.content.settings, announcement },
    projects: initial.content.projects.map((project) => project.slug === "featured-project" ? { ...project, status: "Draft" } : project),
  };
  const save = await fetch(new URL("/api/admin/content", baseUrl), {
    method: "PUT",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ content: updatedContent }),
  });
  assert.equal(save.status, 200);
  const publishedHtml = await (await render()).text();
  assert.match(publishedHtml, new RegExp(announcement));
  assert.doesNotMatch(publishedHtml, /West Indies/);
  assert.equal((await render("/work/featured-project")).status, 404);

  const contact = await fetch(new URL("/api/contact", baseUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Dashboard QA", email: "qa-sender@example.com", discord: "qa_user", projectType: "Gameplay systems", description: "This is an automated dashboard enquiry used to verify the inbox flow." }),
  });
  assert.equal(contact.status, 201);
  assert.equal((await contact.json()).delivery, "stored");

  const refreshed = await fetch(new URL("/api/admin/content", baseUrl), { headers: { cookie } });
  const refreshedData = await refreshed.json();
  const enquiry = refreshedData.enquiries.find((item) => item.email === "qa-sender@example.com");
  assert.ok(enquiry);

  const statusUpdate = await fetch(new URL(`/api/admin/enquiries/${enquiry.id}`, baseUrl), {
    method: "PATCH",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ status: "Replied" }),
  });
  assert.equal(statusUpdate.status, 200);

  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
  const form = new FormData();
  form.set("file", new File([png], "qa-pixel.png", { type: "image/png" }));
  const upload = await fetch(new URL("/api/admin/media", baseUrl), { method: "POST", headers: { cookie }, body: form });
  assert.equal(upload.status, 200);
  const uploaded = await upload.json();
  assert.match(uploaded.url, /^\/api\/media\/[0-9a-f-]{36}$/i);
  const uploadedImage = await fetch(new URL(uploaded.url, baseUrl));
  assert.equal(uploadedImage.status, 200);
  assert.equal(uploadedImage.headers.get("content-type"), "image/png");
  assert.deepEqual(Buffer.from(await uploadedImage.arrayBuffer()), png);

  const remove = await fetch(new URL(`/api/admin/enquiries/${enquiry.id}`, baseUrl), { method: "DELETE", headers: { cookie } });
  assert.equal(remove.status, 200);

  const restore = await fetch(new URL("/api/admin/content", baseUrl), {
    method: "PUT",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ content: initial.content }),
  });
  assert.equal(restore.status, 200);
});
