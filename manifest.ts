import type { ManifestV3Export } from "@crxjs/vite-plugin";

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: "BugTrace (dev)",
  version: "0.0.1",
  action: {
    default_title: "BugTrace",
    default_popup: "src/popup/index.html",
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  permissions: ["storage", "activeTab", "tabs"],
  // 개발 단계에서는 테스트 편의를 위해 넓게 잡음.
  // MVP 안정화 후엔 특정 도메인만으로 줄이거나 optional_host_permissions로 전환 권장.
  host_permissions: ["http://*/*", "https://*/*"],
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/content/main.ts"],
      run_at: "document_start",
    },
  ],
};

export default manifest;
