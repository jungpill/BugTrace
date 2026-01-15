import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Popup from "./Popup";
import { useViewStore } from "../Store/useViewStore";
import DetailPopup from "../components/detailPopup/DetailPopup";

export type PageType = "MAIN" | "DETAIL" | "SETTINGS";

const Root = () => {

  const currentPage = useViewStore((p) => p.currentPage)

  return (
    <React.StrictMode>
      {/* 현재 상태에 따라 다른 컴포넌트 렌더링 */}
      {currentPage === "MAIN" && (
        <Popup/>
      )}
      
      {currentPage === "DETAIL" && (
        <DetailPopup
          
        />
      )}
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Root/>
);