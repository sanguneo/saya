import { build, preview } from "vite";
import { summaryConfig } from "../../server/summary";
import { summaryPlugin } from "../../server/summary-plugin";

const root = process.env.SAYA_QA_ROOT;
const bridge = process.env.SAYA_QA_BRIDGE;
const port = Number(process.env.SAYA_QA_PORT);
if (!root || !bridge || !Number.isInteger(port))
  throw new Error("Missing preview worker configuration");

// This worker and its blank route are test-only, never part of the application build.
await build({ root, logLevel: "error" });
const server = await preview({
  root,
  configFile: false,
  logLevel: "error",
  plugins: [
    // Off unless the QA run sets SAYA_SUMMARY_URL/MODEL (a synthetic model).
    summaryPlugin(summaryConfig(process.env)),
    {
      name: "synthetic-qa-blank",
      configurePreviewServer(previewServer) {
        previewServer.middlewares.use((request, response, next) => {
          if (request.url !== "/__qa/blank") return next();
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.end(
            "<!doctype html><html><head><title>Synthetic blank</title></head><body></body></html>",
          );
        });
      },
    },
  ],
  preview: {
    host: "127.0.0.1",
    port,
    strictPort: true,
    proxy: {
      "/api": {
        target: bridge,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
const address = server.httpServer.address();
if (!address || typeof address === "string")
  throw new Error("Preview has no TCP address");
process.send?.({ type: "ready", port: address.port });
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  await server.close();
  process.exit(0);
}
process.on("message", (message) => {
  if (
    message &&
    typeof message === "object" &&
    "type" in message &&
    message.type === "stop"
  )
    void close();
});
process.on("disconnect", () => void close());
