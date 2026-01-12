import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import type { ErrorRecord } from "../type/types";
import "./index.css";

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

function Popup() {

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
    <div style={{ width: 360, padding: 12, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Current site</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{host ?? "(no tab url)"}</div>
        </div>
        <button onClick={toggle} disabled={!host}>
          {enabled ? "ON" : "OFF"}
        </button>
      </div>

      <hr style={{ margin: "12px 0" }} />

      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Recent Errors</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflow: "auto" }}>
        {records.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r)}
            style={{ textAlign: "left", padding: 8, border: "1px solid #ddd", borderRadius: 10 }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {r.error.message}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{new Date(r.capturedAt).toLocaleString()}</div>
          </button>
        ))}
        {records.length === 0 && <div style={{ fontSize: 12, opacity: 0.6 }}>No records yet.</div>}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button className="bg-blue-500 text-white p-2 rounded flex-1" onClick={() => setSelected(null)} disabled={!selected}>
          Copy Report
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);