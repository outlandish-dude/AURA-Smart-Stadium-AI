import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { TestServer } from "../helpers/testServer.js";

describe("Security & Path Traversal Tests", () => {
  let server;

  before(async () => {
    server = new TestServer(4203);
    await server.start();
  });

  after(() => {
    server.stop();
  });

  test("GET path traversal escaping root returns 404", async () => {
    const res = await server.fetch("/../../../../doesnotexist");
    assert.strictEqual(res.status, 404);
  });

  test("GET /%2e%2e%2f%2e%2e%2fpackage.json (encoded traversal) returns 404", async () => {
    // Encoded traversal that attempts to escape the root
    const res = await server.fetch("/%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2fdoesnotexist");
    assert.strictEqual(res.status, 404);
  });

  test("GET /index.html (safe directory resolution) returns 200", async () => {
    const res = await server.fetch("/index.html");
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes("<html"));
  });

  test("GET non-existent file path returns 404", async () => {
    const res = await server.fetch("/src/doesnotexist.js");
    assert.strictEqual(res.status, 404);
  });

  // --- Favicon & Manifest Serving Tests ---
  test("GET /favicon.ico returns 200 and image/x-icon content type", async () => {
    const res = await server.fetch("/favicon.ico");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("content-type"), "image/x-icon");
  });

  test("GET /favicon.svg returns 200 and image/svg+xml content type", async () => {
    const res = await server.fetch("/favicon.svg");
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get("content-type").includes("image/svg+xml"));
  });

  test("GET /site.webmanifest returns 200 and application/manifest+json content type", async () => {
    const res = await server.fetch("/site.webmanifest");
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get("content-type").includes("application/manifest+json"));
  });

  test("GET /apple-touch-icon.png returns 200 and image/png content type", async () => {
    const res = await server.fetch("/apple-touch-icon.png");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("content-type"), "image/png");
  });
});
