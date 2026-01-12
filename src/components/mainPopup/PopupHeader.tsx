import { AppImage } from "../../assets/images/images"
import { BiSolidBellRing } from "react-icons/bi";

const PopupHeader = () => {
    return(
        <div className="
        bg-[#F3F4F6] flex items-center content-center py-2 px-4 w-full gap-2 
        ">
            <AppImage 
            name="logo" 
            style={{width: 35, height: 35}}
            />

            <div className="rounded-full bg-gray-400 h-2 w-2">
                
            </div>

            <BiSolidBellRing
            className="w-8 h-8 ml-auto text-gray-600 p-1
            hover:bg-gray-400 rounded-full cursor-pointer"
            />
        </div>
    )
}

export default PopupHeader