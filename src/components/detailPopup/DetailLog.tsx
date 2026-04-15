import { useViewStore } from "../../Store/useViewStore";
import ErrorContent from "./ErrorContent";
import ErrorTrace from "./ErrorTrace";
import DetailFooter from "./DetailFooter";

const DetailLog = () => {
  const record = useViewStore((p) => p.selectedRecord);

  if (!record) return null;

  return (
    <div className="flex flex-col bg-white p-2 gap-2 overflow-hidden h-full">
      {/* 스타일 정의: 스크롤바를 완전히 숨김 */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <h3 className="text-[16px] font-[500] pb-2 border-b-2 border-gray-200 shrink-0">
        <span>Details</span>

      </h3>

      <div className="flex-1 overflow-hidden space-y-4">
        {/* 1. User Actions 영역: 독립 스크롤 */}
        <ErrorContent/>

        {/* 2. Stack Trace 영역: 독립 스크롤 및 가로 스크롤 제거 */}
        <ErrorTrace/>

        {/* 3. 로그 저장 및 복사  */}
        <DetailFooter/>
      </div>
    </div>
  );
};

export default DetailLog;