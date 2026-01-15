import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        hook: resolve(__dirname, "src/content/hook.js"),
      },
      output: {
        entryFileNames: "assets/[name].js",
      },
    },
  },
});
