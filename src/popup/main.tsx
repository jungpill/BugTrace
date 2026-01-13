import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Popup from "./Popup";
import { useState } from "react";
import { useViewStore } from "../Store/useViewStore";
import DetailPopup from "../components/detailPopup/DetailPopup";

export type PageType = "MAIN" | "DETAIL" | "SETTINGS";

const Root = () => {

  const currentPage = useViewStore((p) => p.currentPage)
  
  const [selectedData, setSelectedData] = useState<any>(null); // 상세에 넘길 데이터

  
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