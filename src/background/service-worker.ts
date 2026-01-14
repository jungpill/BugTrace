import type { ErrorRecord } from '../type/types';

const RECORDS_KEY = "errorRecords";
const MAX_RECORDS = 20;

/**
 * 메시지 처리 핸들러 분리
 * (비동기 로직을 안전하게 처리하기 위해 리스너 밖으로 뺍니다)
 */
async function handleMessages(msg: any, sendResponse: (response?: any) => void) {
  console.log("Background 수신 메시지:", msg.type);

  try {
    // 1. 에러 캡처 (Content Script -> Background)
    if (msg?.type === "CAPTURE_ERROR") {
      const record = msg.record as ErrorRecord;

      const stored = await chrome.storage.local.get(RECORDS_KEY);
      const prev = Array.isArray(stored[RECORDS_KEY]) ? stored[RECORDS_KEY] : [];
      
      const next = [record, ...prev].slice(0, MAX_RECORDS);
      await chrome.storage.local.set({ [RECORDS_KEY]: next });

      // [핵심] 팝업이 켜져 있다면 실시간 업데이트 알림 전송
      chrome.runtime.sendMessage({ 
        type: "RECORDS_UPDATED", 
        records: next 
      }).catch(() => {
        // 팝업이 닫혀 있을 때 발생하는 에러는 정상적이므로 무시
      });

      sendResponse({ ok: true });
    }

    // 2. 에러 로그 가져오기 (Popup -> Background)
    else if (msg?.type === "GET_RECORDS") {
      const stored = await chrome.storage.local.get(RECORDS_KEY);
      const records = Array.isArray(stored[RECORDS_KEY]) ? stored[RECORDS_KEY] : [];
      
      sendResponse({ ok: true, records });
    }

    // 3. 도메인별 활성화 설정 (Popup -> Background)
    else if (msg?.type === "SET_ENABLED_HOST") {
      const { host, enabled } = msg;
      const stored = await chrome.storage.local.get("enabledHosts");
      const next = { ...(stored.enabledHosts ?? {}), [host]: enabled };
      
      await chrome.storage.local.set({ enabledHosts: next });
      sendResponse({ ok: true });
    }

    else {
      sendResponse({ ok: false, error: "UNKNOWN_MESSAGE" });
    }
  } catch (error) {
    console.error("Background 로직 에러:", error);
    sendResponse({ ok: false, error: String(error) });
  }
}


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // 비동기 처리를 위해 handleMessages를 호출하고 true를 반환하여 채널을 유지함
  handleMessages(msg, sendResponse);
  return true; 
});