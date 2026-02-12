// ═══════════════════════════════════════════════════════
// Cloudflare Worker — TrueVanillaAdmin (Single Server)
// ═══════════════════════════════════════════════════════
// Deploy: Workers & Pages → Create Worker → paste this code
// Then: Triggers → Custom Domains → api-admin.true-vanilla.fr

export default {
  async fetch(request) {
    // ─── CONFIGURATION ───
    const ORIGIN = "http://play.true-vanilla.fr:8275"; // ← Replace with your MC server IP
    const ALLOWED_ORIGIN = "https://staff.true-vanilla.fr";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const url = new URL(request.url);

    // Forward request to MC server
    const targetUrl = ORIGIN + url.pathname + url.search;

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" ? request.body : null,
      });

      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
      return newResponse;
    } catch (err) {
      return new Response(JSON.stringify({ error: "Server unreachable" }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      });
    }
  },
};
