// src/content/main.ts
import type { Breadcrumb, ErrorRecord } from "../type/types";

type EnabledHosts = Record<string, boolean>;
type HistoryStateFn = (data: any, unused: string, url?: string | URL | null) => void;

// hook.js(MAIN world) -> window.postMessage payload 타입 (에러)
type FromPageErrorMsg = {
  type: "FROM_PAGE_ERROR";
  source: string; // runtime/promise/console/network/debug 등
  message: string;
  stack?: string;
};

// hook.js(MAIN world) -> window.postMessage payload 타입 (이벤트: 네트워크 등)
type FromPageEventMsg = {
  type: "FROM_PAGE_EVENT";
  event: {
    kind: "network";
    ts: number;
    transport: "fetch" | "xhr";
    phase: "end";
    method: string;
    url: string;
    status?: number;
    ok?: boolean;
    durationMs: number;
    errorType?: "reject" | "timeout" | "abort" | "error";
  };
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
}

// 공통 record 생성/전송 (에러/네트워크 승격에서 재사용)
function sendRecord(record: ErrorRecord) {
  chrome.runtime.sendMessage({ type: "CAPTURE_ERROR", record }, (res) => {
    if (chrome.runtime.lastError) {
      console.warn("[BugTrace-Main] CAPTURE_ERROR 전송 실패:", chrome.runtime.lastError.message);
      return;
    }

  });
}

async function isCurrentlyEnabled(): Promise<boolean> {
  const stored = await chrome.storage.local.get("enabledHosts");
  const hosts = isEnabledHosts(stored.enabledHosts) ? stored.enabledHosts : {};
  return !!hosts[hostKey];
}

// 네트워크 이벤트를 ErrorRecord로 “승격”할지 정책 (원하면 조정)
function shouldPromoteNetwork(ev: FromPageEventMsg["event"]): boolean {
  // 1) 네트워크 레벨 실패: reject/timeout/error/abort
  if (ev.errorType) return true;
  // 2) 400 ~ 500 사이 에러 
  if (typeof ev.status === "number" && ev.status >= 400){
    return true
  }
  // 3) 서버 에러(500+)
  if (typeof ev.status === "number" && ev.status >= 500) return true;
  // 4) 너무 느린 요청(3초 이상)
  if (typeof ev.durationMs === "number" && ev.durationMs >= 3000) return true;
  return false;
}

// ----------------- page hook -> content script bridge -----------------

window.addEventListener("message", async (event) => {
  const data = event.data as (FromPageErrorMsg | FromPageEventMsg) | undefined;
  if (!data) return;

  // ---- 1) 네트워크 이벤트 수신 (FROM_PAGE_EVENT) ----
  if (data.type === "FROM_PAGE_EVENT" && data.event?.kind === "network") {
    const ev = data.event;

    // breadcrumbs에 네트워크 이벤트도 쌓기 (Breadcrumb 타입에 network가 없으면 타입 에러 날 수 있어 임시 캐스팅)
    pushEvent({
      type: "network",
      ts: ev.ts,
      transport: ev.transport,
      method: ev.method,
      url: ev.url,
      status: ev.status,
      ok: ev.ok,
      durationMs: ev.durationMs,
      errorType: ev.errorType,
    } as unknown as Breadcrumb);

    // enabled=false면 pushEvent가 무시되지만, “승격”은 enabledHosts 기준으로 따로 체크
    const promote = shouldPromoteNetwork(ev);
    if (!promote) return;

    const currentEnabled = await isCurrentlyEnabled();
    if (!currentEnabled) return;

    const message =
      `[network] ${String(ev.transport).toUpperCase()} ${ev.method} ${ev.url} ` +
      `${ev.errorType ? `(${ev.errorType})` : `status=${ev.status}`} duration=${ev.durationMs}ms`;

    const record: ErrorRecord = {
      id: `${Date.now()}`,
      host: hostKey,
      capturedAt: Date.now(),
      error: {
        source: "network",
        ts: Date.now(),
        url: window.location.href,
        message,
        // 네트워크는 스택이 없으니 생략
        stack: undefined,
      },
      breadcrumbs: [...buffer],
      env: {
        ua: navigator.userAgent,
        viewport: { w: window.innerWidth, h: window.innerHeight },
      },
    };

    sendRecord(record);
    return;
  }

  // ---- 2) 기존 에러 수신 (FROM_PAGE_ERROR) ----
  if (data.type !== "FROM_PAGE_ERROR") return;

  const { source: pageSource, message, stack } = data;

  const currentEnabled = await isCurrentlyEnabled();
  if (!currentEnabled) {
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

  sendRecord(record);
});

// ----------------- browser hooks -----------------

function hookRoute() {
  const wrap = (fnName: "pushState" | "replaceState") => {
    const orig = history[fnName] as HistoryStateFn;

    history[fnName] = function (this: History, ...args: Parameters<HistoryStateFn>) {
      const from = location.href;
      const ret = orig.apply(this, args);
      const to = location.href;
      pushEvent({ type: "route", ts: Date.now(), from, to } as Breadcrumb);
      return ret;
    } as unknown as HistoryStateFn;
  };

  wrap("pushState");
  wrap("replaceState");

  window.addEventListener("popstate", () => {
    pushEvent({ type: "route", ts: Date.now(), from: "popstate", to: location.href } as Breadcrumb);
  });

  window.addEventListener("hashchange", () => {
    pushEvent({ type: "route", ts: Date.now(), from: "hashchange", to: location.href } as Breadcrumb);
  });
}

function hookClicks() {
  document.addEventListener(
    "click",
    (ev) => {
      const t = ev.target;
      if (!(t instanceof Element)) return;
      pushEvent({ type: "click", ts: Date.now(), url: location.href, target: summarizeElement(t) } as Breadcrumb);
    },
    { capture: true }
  );
}

// 팝업에서 토글 변경 시 실시간 반영
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.enabledHosts) return;
  const nextHosts = isEnabledHosts(changes.enabledHosts.newValue) ? changes.enabledHosts.newValue : {};
  enabled = !!nextHosts[hostKey];
});

function injectHook() {
  const root = document.head || document.documentElement;
  if (!root) {
    // document_start 극초반 케이스 방어
    setTimeout(injectHook, 0);
    return;
  }

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("assets/hook.js"); // 실제 주입되는 hook.js
  script.async = false;
  root.appendChild(script);
  script.remove();
}

injectHook();

// ----------------- init -----------------

(async function init() {
  await refreshEnabled();
  hookRoute();
  hookClicks();
})();
