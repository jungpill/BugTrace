import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest";
import { resolve } from "path";

// vite.config.ts
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        // hook.js를 컴파일 대상에 명시
        hook: resolve(__dirname, "src/content/hook.js"),
      },
      output: {
        // ✅ 파일 이름에 따라 저장 경로를 동적으로 결정
        entryFileNames: (chunkInfo) => {
          // 서비스 워커(또는 백그라운드)는 루트에 저장
          if (chunkInfo.name === 'service-worker' || chunkInfo.name === 'background') {
            return '[name].js';
          }
          // 나머지는 assets 폴더로
          return 'assets/[name].js';
        },
      },
    },
  },
});