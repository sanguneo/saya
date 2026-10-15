import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import { handleSummary, SUMMARY_PATH, type SummaryConfig } from "./summary";

async function bodyOf(request: IncomingMessage): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  return new Uint8Array(Buffer.concat(chunks));
}

function middleware(config: SummaryConfig | null): Connect.NextHandleFunction {
  return (request, response: ServerResponse, next) => {
    const path = request.url ?? "";
    if (path !== SUMMARY_PATH && !path.startsWith(`${SUMMARY_PATH}?`))
      return next();
    const method = request.method ?? "GET";
    const headers = new Headers(
      Object.entries(request.headers).flatMap(([key, value]) =>
        typeof value === "string" ? [[key, value] as [string, string]] : [],
      ),
    );
    const abort = new AbortController();
    response.on("close", () => abort.abort());
    (method === "POST" ? bodyOf(request) : Promise.resolve(null))
      .then((body) =>
        handleSummary(
          new Request(new URL(path, "http://127.0.0.1"), {
            method,
            headers,
            body: body ? (body.buffer as ArrayBuffer) : null,
            signal: abort.signal,
          }),
          config,
        ),
      )
      .then(async (answer) => {
        if (!answer) return next();
        response.statusCode = answer.status;
        answer.headers.forEach((value, key) => {
          response.setHeader(key, value);
        });
        const bytes = answer.body
          ? new Uint8Array(await answer.arrayBuffer())
          : null;
        response.end(bytes ? Buffer.from(bytes) : undefined);
      })
      .catch(next);
  };
}

/**
 * Mounts /summary on Vite's development and preview servers. Production serves
 * the same handler from `bun server/serve.ts`.
 */
export function summaryPlugin(config: SummaryConfig | null): Plugin {
  return {
    name: "saya-summary",
    configureServer(server) {
      server.middlewares.use(middleware(config));
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware(config));
    },
  };
}
