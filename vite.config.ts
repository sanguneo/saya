import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import {
  adapterProxies,
  adaptersPlugin,
  adapterUpstreams,
} from "./server/adapters";
import { assistConfig } from "./server/assist";
import { assistPlugin } from "./server/assist-plugin";
import { unfurlPlugin } from "./server/plugin";
import { writesPlugin } from "./server/writes";

export default defineConfig(({ mode }) => {
  // These server-only variables must never use Vite's browser-exposed prefix.
  const env = loadEnv(mode, process.cwd(), "SAYA_");
  const token = env.SAYA_CORE_TOKEN;
  const adapters = adapterUpstreams(env);
  // Opt-in 문의 모아보기 helper; its file may also say where the KakaoTalk core is.
  const assist = assistConfig(env);

  return {
    // The unfurl endpoint lives on /unfurl, deliberately outside /api: it is a
    // facility of the proxy, never part of the contract the cores answer.
    // Writes are held to the same body rule as the Caddyfile before they are
    // proxied: JSON, or multipart on an upload route within its bound.
    plugins: [
      react(),
      writesPlugin(),
      unfurlPlugin(),
      assistPlugin(assist),
      adaptersPlugin(adapters),
    ],
    server: {
      host: "127.0.0.1",
      proxy: {
        "/api": {
          target:
            env.SAYA_CORE_URL || assist?.kakaoCore || "http://127.0.0.1:8765",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api(?=\/|\?|$)/, ""),
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
        // Messenger adapters (tsuba), one upstream each; the token is added here.
        ...adapterProxies(adapters),
      },
    },
  };
});
