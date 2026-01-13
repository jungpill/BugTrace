import { useState, useEffect } from "react";
import Toggle from "../common/Toggle";

const SiteCaptureToggle = () => {

    const [currentDomain, setCurrentDomain] = useState<string>("example.com");
    const [toggleActive, setToggleActive] = useState<boolean>(false);

    useEffect(() => {
        if (typeof chrome !== "undefined" && chrome.tabs) {
            chrome.tabs.query({
            active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
            const url = new URL(tabs[0].url);
            const hostname = url.hostname.replace(/^www\./, "");
            setCurrentDomain(hostname);
        }
        });
    }
    }, [toggleActive]);

    return(
        <div className="bg-white gap-2 flex flex-col w-full p-4">
            <p className="text-[14px] font-[400]">
                Current Site
            </p>

            <div className="flex items-center flex-row">
                <p className="text-[18px] font-[600] text-gray-600 font-[700] mr-auto">
                    {toggleActive ? currentDomain : "No site captured"}
                </p>

                <Toggle
                active={toggleActive}
                onToggle={() => setToggleActive(!toggleActive)}
                />
            </div>
        </div>
    )
}

export default SiteCaptureToggle;