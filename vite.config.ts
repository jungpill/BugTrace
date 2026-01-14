import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
      // 익스텐션 환경에서는 프로토콜을 명시하는 것이 안정적입니다.
      protocol: 'ws',
      host: 'localhost',
    },
  },
});