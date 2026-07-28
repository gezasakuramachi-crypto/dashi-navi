import http from "node:http";

const PORT = Number.parseInt(process.env.PORT || "8080", 10);
const TRACCAR_BASE_URL = (process.env.TRACCAR_BASE_URL || "").replace(/\/+$/, "");
const TRACCAR_TOKEN = process.env.TRACCAR_TOKEN || "";
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ||
  "https://gezasakuramachi-crypto.github.io";
const ALLOWED_DEVICE_IDS = new Set(
  (process.env.ALLOWED_DEVICE_IDS || "1")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);

const noStoreHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff"
};

function sendJson(response, status, body, origin) {
  response.writeHead(status, {
    ...noStoreHeaders,
    ...(origin === ALLOWED_ORIGIN
      ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
      : {})
  });
  response.end(JSON.stringify(body));
}

function positionPayload(position) {
  return {
    latitude: position.latitude,
    longitude: position.longitude,
    deviceTime: position.deviceTime || null,
    fixTime: position.fixTime || null,
    serverTime: position.serverTime || null
  };
}

export function createServer(fetchImpl = fetch) {
  return http.createServer(async (request, response) => {
    const origin = request.headers.origin || "";
    const url = new URL(request.url, "http://localhost");

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { ok: true }, origin);
      return;
    }

    if (request.method !== "GET" || url.pathname !== "/api/positions") {
      sendJson(response, 404, { error: "Not found" }, origin);
      return;
    }

    if (origin && origin !== ALLOWED_ORIGIN) {
      sendJson(response, 403, { error: "Origin not allowed" }, origin);
      return;
    }

    const deviceId = url.searchParams.get("deviceId") || "";
    if (!ALLOWED_DEVICE_IDS.has(deviceId)) {
      sendJson(response, 404, { error: "Device not found" }, origin);
      return;
    }

    if (!TRACCAR_BASE_URL || !TRACCAR_TOKEN) {
      sendJson(response, 503, { error: "Service not configured" }, origin);
      return;
    }

    try {
      const upstreamUrl =
        `${TRACCAR_BASE_URL}/api/positions?deviceId=${encodeURIComponent(deviceId)}`;
      const upstream = await fetchImpl(upstreamUrl, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${TRACCAR_TOKEN}`
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!upstream.ok) {
        sendJson(response, 502, { error: "Position service unavailable" }, origin);
        return;
      }

      const positions = await upstream.json();
      const latest = Array.isArray(positions) ? positions.at(-1) : null;
      if (!latest) {
        sendJson(response, 404, { error: "Position not available" }, origin);
        return;
      }

      sendJson(response, 200, positionPayload(latest), origin);
    } catch (error) {
      console.error("Failed to load position", error);
      sendJson(response, 502, { error: "Position service unavailable" }, origin);
    }
  });
}

if (process.env.NODE_ENV !== "test") {
  createServer().listen(PORT, "0.0.0.0", () => {
    console.log(`Position API listening on port ${PORT}`);
  });
}
