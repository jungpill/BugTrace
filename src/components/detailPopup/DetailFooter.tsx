import { useViewStore } from "../../Store/useViewStore";
import { DefaultButton } from "../common/Button";
import Copy from '../../assets/images/icon_copy.svg'
import Download from '../../assets/images/icon_download.svg'

const DetailFooter = () => {

    return(
        <div className="flex gap-4 w-full">  
            <DefaultButton
            onClick={() => { console.log("로그 저장") }}>
                <img 
                src={Download} 
                alt="export" 
                className="mr-2 h-4 w-4"
                />
                export Log
            </DefaultButton>
            <DefaultButton
            onClick={() => { console.log("로그 복사") }}>
                <img 
                src={Copy} 
                alt="copy" 
                className="mr-2 h-4 w-4"
                />
                copy Log
            </DefaultButton>
        </div>
    )
}

export default DetailFooter