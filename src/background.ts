import type { ErrorRecord } from './type/types.ts'

const RECORDS_KEY = "errorRecords";
const MAX_RECORDS = 20;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg?.type === "CAPTURE_ERROR") {
      const record = msg.record as ErrorRecord;

      const stored = (await chrome.storage.local.get(RECORDS_KEY)) as {
        [RECORDS_KEY]?: unknown;
      };

      const prev = Array.isArray(stored[RECORDS_KEY])
        ? (stored[RECORDS_KEY] as ErrorRecord[])
        : [];

      const next = [record, ...prev].slice(0, MAX_RECORDS);

      await chrome.storage.local.set({ [RECORDS_KEY]: next });
      sendResponse({ ok: true });
      return;
    }

    if (msg?.type === "GET_RECORDS") {
      const stored = (await chrome.storage.local.get(RECORDS_KEY)) as {
        [RECORDS_KEY]?: unknown;
      };

      const records = Array.isArray(stored[RECORDS_KEY])
        ? (stored[RECORDS_KEY] as ErrorRecord[])
        : [];

      sendResponse({ ok: true, records });
      return;
    }

    if (msg?.type === "SET_ENABLED_HOST") {
      const { host, enabled } = msg as { host: string; enabled: boolean };

      const stored = (await chrome.storage.local.get("enabledHosts")) as {
        enabledHosts?: Record<string, boolean>;
      };

      const next = { ...(stored.enabledHosts ?? {}), [host]: enabled };
      await chrome.storage.local.set({ enabledHosts: next });

      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false, error: "UNKNOWN_MESSAGE" });
  })();

  return true;
});