import DetailHeader from "./DetailHeader"
import DetailLog from "./DetailLog"

interface Props{

}

const DetailPopup = () => {

    return(
        <div className="w-90 flex flex-col">
            <DetailHeader/>
            <DetailLog/>
        </div>
    )
}

export default DetailPopup