import type { ErrorRecord } from '../type/types'

const RECORDS_KEY = "errorRecords";
const MAX_RECORDS = 20;

//팝업이나 컨텐츠에서 보내는 모든 메시지 수신 
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    //에러 발생시 로직 
    if (msg?.type === "CAPTURE_ERROR") {
      const record = msg.record as ErrorRecord;

      const stored = (await chrome.storage.local.get(RECORDS_KEY)) as {
        [RECORDS_KEY]?: unknown;
      };

      const prev = Array.isArray(stored[RECORDS_KEY])
        ? (stored[RECORDS_KEY] as ErrorRecord[])
        : [];

      // 기존 에러가 있는지 체크 후 있다면 제일 앞 없다면 빈 배열 생성

      const next = [record, ...prev].slice(0, MAX_RECORDS);
      await chrome.storage.local.set({ [RECORDS_KEY]: next });
      // 최대 20개 까지만 에러를 저장 이후 최신화된 에러 리스트를 스토리지에 업데이트

      chrome.runtime.sendMessage({ 
        type: "RECORDS_UPDATED", 
        records: next 
      }).catch(() => {
        
      });

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