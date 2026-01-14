import PopupHeader from "../components/mainPopup/PopupHeader";
import SiteCaptureToggle from "../components/mainPopup/SiteCaptureToggle";
import RecentError from "../components/mainPopup/RecentError";

const Popup = () =>{

  return (
    <div className="w-90 flex flex-col">
        <PopupHeader/>
        <SiteCaptureToggle/>
        <RecentError/>
    </div>
  );
}

export default Popup