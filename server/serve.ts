import { handleUnfurl } from "./handler";
import { handleHub } from "./hub";
import {
  MIN_REGISTER_TOKEN_LENGTH,
  Registry,
  registerHandler,
} from "./registry";
import { handleSummary, summaryConfig } from "./summary";

/**
 * saya's server for production, reached only through the site's own reverse
 * proxy, which enforces origin and the write rules in front of it. It answers
 * /unfurl, and, when SAYA_REGISTER_TOKEN is set, /api and /adapters from what
 * cores and adapters registered on the separate register listener. Both
 * listeners bind loopback by default; expose the register port to the tailnet
 * only (tailscale serve), never on the site's origin.
 *
 *   SAYA_REGISTER_TOKEN=... bun server/serve.ts
 */
const env = process.env;
const hostname = env.SAYA_SERVER_HOST ?? env.SAYA_UNFURL_HOST ?? "127.0.0.1";
const port = Number.parseInt(
  env.SAYA_SERVER_PORT ?? env.SAYA_UNFURL_PORT ?? "8791",
  10,
);
const token = env.SAYA_REGISTER_TOKEN;
if (token !== undefined && token.length < MIN_REGISTER_TOKEN_LENGTH) {
  console.error(
    `SAYA_REGISTER_TOKEN must be at least ${MIN_REGISTER_TOKEN_LENGTH} characters`,
  );
  process.exit(1);
}
const registry = token ? new Registry() : null;
const summary = summaryConfig(env);

Bun.serve({
  port,
  hostname,
  idleTimeout: 30,
  async fetch(request, server) {
    const unfurled = await handleUnfurl(request);
    if (unfurled) return unfurled;
    // A model can take longer than the idle limit to answer; its own timeout bounds it.
    server.timeout(request, 90);
    const summarised = await handleSummary(request, summary);
    if (summarised) return summarised;
    server.timeout(request, 30);
    if (registry) {
      // A stream or a large upload is quiet for longer than any idle limit;
      // the upstream, or the browser leaving, is what ends it.
      server.timeout(request, 0);
      const proxied = await handleHub(request, registry);
      if (proxied) return proxied;
    }
    return new Response(null, { status: 404 });
  },
});
console.log(`saya server listening on ${hostname}:${port}`);

if (registry && token) {
  const registerHost = env.SAYA_REGISTER_HOST ?? "127.0.0.1";
  const registerPort = Number.parseInt(env.SAYA_REGISTER_PORT ?? "8798", 10);
  Bun.serve({
    port: registerPort,
    hostname: registerHost,
    fetch: registerHandler(registry, token),
  });
  console.log(`saya register listening on ${registerHost}:${registerPort}`);
}
