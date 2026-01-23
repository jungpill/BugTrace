import { useState, useEffect } from "react";
import Toggle from "../common/Toggle";
import { useActiveStore } from "../../Store/useActiveStore";

const SiteCaptureToggle = () => {
    const [currentDomain, setCurrentDomain] = useState<string>("example.com");
    const active = useActiveStore((p) => p.active);
    const initActive = useActiveStore((p) => p.initActive);
    const toggleActive = useActiveStore((p) => p.toggleActive);

    const text = active ? currentDomain : "No site captured";

    useEffect(() => {
        if (typeof chrome !== "undefined" && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.url) {
                    try {
                        const url = new URL(tabs[0].url);
                        const hostKey = url.host.replace(/^www\./, ""); 
                        
                        setCurrentDomain(hostKey);
                        initActive(hostKey);
                    } catch (e) {
                        setCurrentDomain("Invalid URL");
                    }
                }
            });
        }
    }, [initActive]);

    return (
        <div className="bg-white gap-2 flex flex-col w-full p-4">
            <p className="text-[14px] font-[800] text-">Current Site</p>

            <div className="flex items-center flex-row">
                <p className="text-[18px] font-[700] text-gray-600 mr-auto">
                    <span 
                        className="inline-block animate-fadeUp" 
                        key={`${active}-${currentDomain}`}
                    >
                        {text}
                    </span>
                </p>

                <Toggle active={active} onToggle={() => toggleActive(currentDomain)} />
            </div>
        </div>
    );
}

export default SiteCaptureToggle;