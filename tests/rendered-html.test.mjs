import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
let server;
let baseUrl;

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
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "ignore",
  });
  await waitForServer();
});

after(() => server?.kill());

async function render(path = "/") {
  return fetch(new URL(path, baseUrl), { headers: { accept: "text/html" } });
}

test("server-renders the portfolio homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Pogdog/i);
  assert.match(html, /Roblox/i);
});

test("server-renders protected-area surfaces and the case study route", async () => {
  const [admin, login, caseStudy] = await Promise.all([
    render("/admin"),
    render("/admin/login"),
    render("/work/featured-project"),
  ]);
  assert.equal(admin.status, 307);
  assert.match(admin.headers.get("location") ?? "", /\/admin\/login/);
  assert.equal(login.status, 200);
  assert.equal(caseStudy.status, 200);
  assert.match(await login.text(), /Welcome back/i);
  assert.match(await caseStudy.text(), /What was happening|Featured Project/i);
});