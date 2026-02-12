// ═══════════════════════════════════════════════════════
// Cloudflare Worker — TrueVanillaAdmin (Single Server)
// ═══════════════════════════════════════════════════════

// ─── CONFIGURATION ───────────────────────────────────
const ORIGIN = "http://145.239.149.173:8275"; // ← Replace with your MC server IP
const ALLOWED_ORIGIN = "https://staff.true-vanilla.fr";
// ─────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request) {
    // ALWAYS handle OPTIONS preflight — no matter what
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const targetUrl = ORIGIN + url.pathname + url.search;

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          "Content-Type":
            request.headers.get("Content-Type") || "application/json",
          Authorization: request.headers.get("Authorization") || "",
        },
        body:
          request.method !== "GET" && request.method !== "HEAD"
            ? request.body
            : null,
      });

      // Clone and add CORS headers
      const body = await response.text();
      return new Response(body, {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") || "application/json",
          ...CORS_HEADERS,
        },
      });
    } catch (err) {
      // Server unreachable — still return valid CORS response
      return new Response(
        JSON.stringify({
          error: "Serveur Minecraft injoignable",
          detail: err.message,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        },
      );
    }
  },
};
