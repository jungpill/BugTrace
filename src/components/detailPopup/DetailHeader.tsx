import { FaArrowLeft } from "react-icons/fa6";

const DetailHeader = () => {
    return(
        <div className="
        bg-[#F3F3F3] flex items-center content-center py-2 px-4 w-full gap-2 
        ">
            <FaArrowLeft
            className="w-6 h-6 text-gray-600 p-1
            hover:bg-gray-200 rounded-full cursor-pointer"
            />

            <h3 className="text-[16px] font-[500] truncate w-70">
                    asdasdasdasasdasdas
            </h3>
        </div>
    )
}

export default DetailHeader