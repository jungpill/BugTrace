import type { Breadcrumb, ErrorRecord } from "../type/types";

type EnabledHosts = Record<string, boolean>;

type HistoryStateFn = (data: any, unused: string, url?: string | URL | null) => void;

function isEnabledHosts(v: unknown): v is EnabledHosts {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const MAX_EVENTS = 50;
let enabled = false;
let buffer: Breadcrumb[] = [];

function pushEvent(e: Breadcrumb) {
  if (!enabled) return;
  buffer.push(e);
  if (buffer.length > MAX_EVENTS) buffer.shift();
}

function makeId() {
  // crypto.randomUUID 지원이 없을 수도 있어 fallback 포함
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis.crypto as any)?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
  const host = location.host;

  const stored = (await chrome.storage.local.get("enabledHosts")) as {
    enabledHosts?: unknown;
  };

  const enabledHosts: EnabledHosts = isEnabledHosts(stored.enabledHosts)
    ? (stored.enabledHosts as EnabledHosts)
    : {};

  enabled = Boolean(enabledHosts[host]);
  if (!enabled) buffer = [];
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.enabledHosts) {
    const nextHosts: EnabledHosts = isEnabledHosts(changes.enabledHosts.newValue)
      ? (changes.enabledHosts.newValue as EnabledHosts)
      : {};

    enabled = Boolean(nextHosts[location.host]);
    if (!enabled) buffer = [];
  }
});

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

function captureAndSend(source: "error" | "unhandledrejection", message: string, stack?: string) {
  if (!enabled) return;

  const record: ErrorRecord = {
    id: makeId(),
    host: location.host,
    capturedAt: Date.now(),
    error: { source, ts: Date.now(), url: location.href, message, stack },
    breadcrumbs: [...buffer],
    env: { ua: navigator.userAgent, viewport: { w: window.innerWidth, h: window.innerHeight } },
  };

  chrome.runtime.sendMessage({ type: "CAPTURE_ERROR", record });
}

function hookErrors() {
  window.addEventListener("error", (ev) => {
    const e = ev as ErrorEvent;
    captureAndSend("error", e.message || "Unknown error", e.error?.stack);
  });

  window.addEventListener("unhandledrejection", (ev) => {
    const e = ev as PromiseRejectionEvent;
    const reason: any = e.reason;
    captureAndSend("unhandledrejection", reason?.message ?? String(reason ?? "Unhandled rejection"), reason?.stack);
  });
}

(async function main() {
  await refreshEnabled();
  hookRoute();
  hookClicks();
  hookErrors();
})();