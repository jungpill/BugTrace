import { useState, useEffect } from "react";
import type { ErrorRecord } from "../type/types";
import PopupHeader from "../components/mainPopup/PopupHeader";
import SiteCaptureToggle from "../components/mainPopup/SiteCaptureToggle";
import RecentError from "../components/mainPopup/RecentError";

function formatRecord(r: ErrorRecord) {
  const lines = [
    `# Error Report`,
    `- Host: ${r.host}`,
    `- Time: ${new Date(r.capturedAt).toISOString()}`,
    `- URL: ${r.error.url}`,
    `- Source: ${r.error.source}`,
    `- Message: ${r.error.message}`,
    r.error.stack ? `\n## Stack\n${r.error.stack}` : "",
    `\n## Breadcrumbs`,
    ...r.breadcrumbs.map((b) => {
      if (b.type === "click") return `- [click] ${new Date(b.ts).toISOString()} ${b.target}`;
      return `- [route] ${new Date(b.ts).toISOString()} ${b.from} -> ${b.to}`;
    }),
  ].filter(Boolean);
  return lines.join("\n");
}

type EnabledHosts = Record<string, boolean>;

async function getCurrentHost(): Promise<string | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  try {
    return new URL(tab.url).host;
  } catch {
    return null;
  }
}

const Popup = () =>{

  const [host, setHost] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [records, setRecords] = useState<ErrorRecord[]>([]);
  const [selected, setSelected] = useState<ErrorRecord | null>(null);

  useEffect(() => {
    (async () => {
      const h = await getCurrentHost();
      setHost(h);

      const stored = (await chrome.storage.local.get("enabledHosts")) as {
        enabledHosts?: EnabledHosts;
      };
      const enabledHosts = stored.enabledHosts ?? {};

      if (h) setEnabled(Boolean(enabledHosts[h]));
      else setEnabled(false);

      const res = await chrome.runtime.sendMessage({ type: "GET_RECORDS" });
      setRecords(Array.isArray(res?.records) ? (res.records as ErrorRecord[]) : []);
    })();
  }, []);

  useEffect(() => {
    const onChanged = (changes: any, area: string) => {
      if (area !== "local") return;

      if (changes.errorRecords) {
        const next = changes.errorRecords.newValue;
        setRecords(Array.isArray(next) ? (next as ErrorRecord[]) : []);
      }

      if (changes.enabledHosts && host) {
        const nextHosts = (changes.enabledHosts.newValue ?? {}) as EnabledHosts;
        setEnabled(Boolean(nextHosts[host]));
      }
    };

    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, [host]);

  const toggle = async () => {
    if (!host) return;
    await chrome.runtime.sendMessage({ type: "SET_ENABLED_HOST", host, enabled: !enabled });
  };

  const copy = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(formatRecord(selected));
  };

  return (
    <div className="w-90 rounded-2xl flex flex-col ">
        <PopupHeader/>

        <SiteCaptureToggle/>

        <RecentError/>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button className="bg-blue-500 text-white p-2 rounded flex-1" onClick={() => setSelected(null)} disabled={!selected}>
          Copy Report
        </button>
      </div>
    </div>
  );
}

export default Popup