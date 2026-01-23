import { AppImage } from "../../assets/images/images"
import { BiSolidBellRing } from "react-icons/bi";
import { useActiveStore } from "../../Store/useActiveStore";

const PopupHeader = () => {
    
    const active = useActiveStore((p) => p.active);

    return(
        <header className="
        bg-[#F3F3F3] flex items-center content-center py-2 px-4 w-full gap-2 
        ">
            <AppImage 
            name="logo" 
            style={{width: 35, height: 35}}
            />

            <div className={
                `rounded-full
                ${active ? "bg-green-500" : "bg-[#F3F3F3]"}
                h-2 w-2
                transition-all duration-200
                `}
            >
                
            </div>
        </header>
    )
}

export default PopupHeader