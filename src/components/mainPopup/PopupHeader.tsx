import { AppImage } from "../../assets/images/images"

const PopupHeader = () => {
    return(
        <div className="
        bg-[#F3F4F6] flex items-center content-center p-2 w-full gap-2
        ">
            <AppImage 
            name="logo" 
            style={{width: 35, height: 35}}
            />

            <div className="rounded-full bg-gray-400 h-2 w-2">
                
            </div>
        </div>
    )
}

export default PopupHeader