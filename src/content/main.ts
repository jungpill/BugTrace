// src/content/main.ts
import type { Breadcrumb, ErrorRecord } from "../type/types";

console.log("BugTrace Content Script Loaded! Host:", location.host);

type EnabledHosts = Record<string, boolean>;
type HistoryStateFn = (data: any, unused: string, url?: string | URL | null) => void;

// hook.ts(MAIN world) -> window.postMessage payload 타입
type FromPageErrorMsg = {
  type: "FROM_PAGE_ERROR";
  // hook.ts에서 보내는 source (runtime/promise/console)
  source: string;
  message: string;
  stack?: string;
};

const MAX_EVENTS = 50;
const hostKey = location.host.replace(/^www\./, "");

let enabled = false;
let buffer: Breadcrumb[] = [];

// ----------------- utils -----------------

function isEnabledHosts(v: unknown): v is EnabledHosts {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function pushEvent(e: Breadcrumb) {
  if (!enabled) return;
  buffer.push(e);
  if (buffer.length > MAX_EVENTS) buffer.shift();
}

function summarizeElement(el: Element): string {
  const h = el as HTMLElement;
  const testId = h.getAttribute("data-testid") || h.getAttribute("data-cy");
  if (testId) return `${el.tagName.toLowerCase()}[data-testid="${testId}"]`;
  const aria = h.getAttribute("aria-label");
  if (aria) return `${el.tagName.toLowerCase()}[aria-label="${aria}"]`;
  if (h.id) return `${el.tagName.toLowerCase()}#${h.id}`;
  const text = (h.innerText || "").trim().slice(0, 30);
  return text ? `${el.tagName.toLowerCase()} text="${text}"` : el.tagName.toLowerCase();
}

async function refreshEnabled() {
  const stored = await chrome.storage.local.get("enabledHosts");
  const enabledHosts = isEnabledHosts(stored.enabledHosts) ? stored.enabledHosts : {};
  enabled = !!enabledHosts[hostKey];
  console.log("[BugTrace] 초기 상태 확인:", { hostKey, enabled, enabledHosts });
}

// ----------------- page hook -> content script bridge -----------------

window.addEventListener("message", (event) => {
  const data = event.data as FromPageErrorMsg | undefined;
  if (!data || data.type !== "FROM_PAGE_ERROR") return;

  const { source: pageSource, message, stack } = data;

  console.log("[BugTrace-Main] 🚀 페이지로부터 에러 수신:", { pageSource, message });

  chrome.storage.local.get("enabledHosts").then((stored) => {
    const hosts = isEnabledHosts(stored.enabledHosts) ? stored.enabledHosts : {};
    const currentEnabled = !!hosts[hostKey];

    if (!currentEnabled) {
      console.warn("[BugTrace-Main] 수집 비활성화(OFF)라 전송 스킵");
      return;
    }

    const record: ErrorRecord = {
      id: `${Date.now()}`,
      host: hostKey,
      capturedAt: Date.now(),
      error: {
        source: "error",
        ts: Date.now(),
        url: window.location.href,
        message: `[${pageSource}] ${message}`,
        stack,
      },
      breadcrumbs: [...buffer],
      env: {
        ua: navigator.userAgent,
        viewport: { w: window.innerWidth, h: window.innerHeight },
      },
    };

    chrome.runtime.sendMessage({ type: "CAPTURE_ERROR", record }, (res) => {
      if (chrome.runtime.lastError) {
        console.warn("[BugTrace-Main] CAPTURE_ERROR 전송 실패:", chrome.runtime.lastError.message);
        return;
      }
      console.log("[BugTrace-Main] ✅ 서비스 워커 전송 완료:", res);
    });
  });
});

// ----------------- browser hooks -----------------

function hookRoute() {
  const wrap = (fnName: "pushState" | "replaceState") => {
    const orig = history[fnName] as HistoryStateFn;

    history[fnName] = function (this: History, ...args: Parameters<HistoryStateFn>) {
      const from = location.href;
      const ret = orig.apply(this, args);
      const to = location.href;
      pushEvent({ type: "route", ts: Date.now(), from, to });
      return ret;
    } as unknown as HistoryStateFn;
  };

  wrap("pushState");
  wrap("replaceState");

  window.addEventListener("popstate", () => {
    pushEvent({ type: "route", ts: Date.now(), from: "popstate", to: location.href });
  });

  window.addEventListener("hashchange", () => {
    pushEvent({ type: "route", ts: Date.now(), from: "hashchange", to: location.href });
  });
}

function hookClicks() {
  document.addEventListener(
    "click",
    (ev) => {
      const t = ev.target;
      if (!(t instanceof Element)) return;
      pushEvent({ type: "click", ts: Date.now(), url: location.href, target: summarizeElement(t) });
    },
    { capture: true }
  );
}

// 팝업에서 토글 변경 시 실시간 반영
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.enabledHosts) return;
  const nextHosts = isEnabledHosts(changes.enabledHosts.newValue) ? changes.enabledHosts.newValue : {};
  enabled = !!nextHosts[hostKey];
  console.log("[BugTrace] 상태 변경됨:", { hostKey, enabled });
});

function injectHook() {
  const root = document.head || document.documentElement;
  if (!root) {
    // document_start 극초반 케이스 방어
    setTimeout(injectHook, 0);
    return;
  }

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("assets/hook.js");
  script.async = false;
  root.appendChild(script);
  script.remove();
  console.log("[BugTrace] hook.js injected into MAIN world:", script.src);
}

injectHook();

// ----------------- init -----------------

(async function init() {
  await refreshEnabled();
  hookRoute();
  hookClicks();

  console.log("[BugTrace] 모든 감시 준비 완료");

  // 디버깅이 필요하면 잠깐 켰다가 끄세요.
  // 이게 저장되면 파이프라인은 정상이고, 페이지 에러만 안 잡히는 문제는 hook.ts 쪽입니다.
  // setTimeout(() => { throw new Error("TEST_FROM_CONTENT_SCRIPT"); }, 2000);
})();