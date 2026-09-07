import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the portfolio homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /PogDog/i);
  assert.match(html, /Roblox Development/i);
  assert.match(html, /Featured Project/i);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|Building your site/i);
});

test("server-renders protected-area surfaces and the case study route", async () => {
  const [admin, login, caseStudy] = await Promise.all([render("/admin"), render("/admin/login"), render("/work/featured-project")]);
  assert.equal(admin.status, 307);
  assert.match(admin.headers.get("location") ?? "", /\/admin\/login/);
  assert.equal(login.status, 200);
  assert.equal(caseStudy.status, 200);
  assert.match(await login.text(), /Welcome back/i);
  assert.match(await caseStudy.text(), /What was happening|Featured Project/i);
});
