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
const POSITION_CACHE_TTL_MS = Number.parseInt(
  process.env.POSITION_CACHE_TTL_MS || "30000",
  10
);
const UPSTREAM_TIMEOUT_MS = Number.parseInt(
  process.env.UPSTREAM_TIMEOUT_MS || "15000",
  10
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
  let cachedPositions = null;
  let cacheUpdatedAt = 0;
  let upstreamRequest = null;

  async function loadCurrentPositions() {
    const now = Date.now();
    if (
      cachedPositions &&
      Number.isFinite(POSITION_CACHE_TTL_MS) &&
      now - cacheUpdatedAt < POSITION_CACHE_TTL_MS
    ) {
      return cachedPositions;
    }

    if (upstreamRequest) return upstreamRequest;

    upstreamRequest = (async () => {
      /*
       * Traccarは /api/positions を引数なしで呼ぶと、許可された端末の
       * 最新位置を返します。deviceIdだけを付けると履歴検索扱いとなり、
       * from/toが必要になるため、ここでは全端末の最新位置から絞り込みます。
       */
      const upstream = await fetchImpl(`${TRACCAR_BASE_URL}/api/positions`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${TRACCAR_TOKEN}`
        },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
      });

      if (!upstream.ok) {
        console.error(`Traccar positions request failed: HTTP ${upstream.status}`);
        throw new Error("Position service unavailable");
      }

      const positions = await upstream.json();
      cachedPositions = Array.isArray(positions) ? positions : [];
      cacheUpdatedAt = Date.now();
      return cachedPositions;
    })();

    try {
      return await upstreamRequest;
    } finally {
      upstreamRequest = null;
    }
  }

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
      const positions = await loadCurrentPositions();
      const latest = positions
        .filter((position) => String(position.deviceId) === deviceId)
        .at(-1);
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
