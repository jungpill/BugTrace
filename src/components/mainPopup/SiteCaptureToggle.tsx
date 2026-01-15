import { useState, useEffect } from "react";
import Toggle from "../common/Toggle";
import { useActiveStore } from "../../Store/useActiveStore";

const SiteCaptureToggle = () => {

    const [currentDomain, setCurrentDomain] = useState<string>("example.com");
    const active = useActiveStore((p) => p.active);
    const initActive = useActiveStore((p) => p.initActive);
    const toggleActive = useActiveStore((p) => p.toggleActive);

    useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
                try {
                    const url = new URL(tabs[0].url);
                    // hostname(localhost) -> host(localhost:3001)로 변경
                    const hostKey = url.host.replace(/^www\./, ""); 
                    
                    setCurrentDomain(hostKey);
                    initActive(hostKey); // 이제 "localhost:3001"로 저장됩니다.
                } catch (e) {
                    setCurrentDomain("Invalid URL");
                }
            }
        });
    }
}, [initActive]);

    return(
        <div className="bg-white gap-2 flex flex-col w-full p-4">
            <p className="text-[14px] font-[400]">
                Current Site
            </p>

            <div className="flex items-center flex-row">
                <p className="text-[18px] font-[600] text-gray-600 font-[700] mr-auto">
                    {active ? currentDomain : "No site captured"}
                </p>

                <Toggle
                active={active}
                onToggle={() => toggleActive(currentDomain)}
                />
            </div>
        </div>
    )
}

export default SiteCaptureToggle;