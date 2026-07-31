import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";

process.env.NODE_ENV = "test";
process.env.TRACCAR_BASE_URL = "https://traccar.example";
process.env.TRACCAR_TOKEN = "secret-token";
process.env.ALLOWED_ORIGIN = "https://gezasakuramachi-crypto.github.io";
process.env.ALLOWED_DEVICE_IDS = "1,2";

const { createServer } = await import("./server.mjs");
let server;
let baseUrl;
let upstreamRequest;

before(async () => {
  server = createServer(async (url, options) => {
    upstreamRequest = { url, options };
    return new Response(
      JSON.stringify([
        {
          latitude: 35.96,
          longitude: 140.63,
          deviceTime: "2026-07-28T08:00:00.000Z",
          attributes: { private: "not exposed" }
        }
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test("returns only the public position fields", async () => {
  const response = await fetch(`${baseUrl}/api/positions?deviceId=1`, {
    headers: { Origin: process.env.ALLOWED_ORIGIN }
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), process.env.ALLOWED_ORIGIN);
  assert.deepEqual(await response.json(), {
    latitude: 35.96,
    longitude: 140.63,
    deviceTime: "2026-07-28T08:00:00.000Z",
    fixTime: null,
    serverTime: null
  });
  assert.equal(upstreamRequest.options.headers.Authorization, "Bearer secret-token");
  assert.equal(upstreamRequest.url, "https://traccar.example/api/positions?deviceId=1");
});

test("rejects unapproved devices", async () => {
  const response = await fetch(`${baseUrl}/api/positions?deviceId=999`);
  assert.equal(response.status, 404);
});

test("allows the Sakuramachi iPhone SE2", async () => {
  const response = await fetch(`${baseUrl}/api/positions?deviceId=2`);
  assert.equal(response.status, 200);
  assert.equal(upstreamRequest.url, "https://traccar.example/api/positions?deviceId=2");
});

test("rejects other browser origins", async () => {
  const response = await fetch(`${baseUrl}/api/positions?deviceId=1`, {
    headers: { Origin: "https://example.com" }
  });
  assert.equal(response.status, 403);
});
