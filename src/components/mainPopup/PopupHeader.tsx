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

            <BiSolidBellRing
            className="w-8 h-8 ml-auto text-gray-600 p-1
            hover:bg-gray-400 rounded-full cursor-pointer"
            />
        </header>
    )
}

export default PopupHeader