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

const Popup = () =>{

  const [selected, setSelected] = useState<ErrorRecord | null>(null);

  return (
    <div className="w-90 flex flex-col">
        <PopupHeader/>
        <SiteCaptureToggle/>
        <RecentError/>
    </div>
  );
}

export default Popup