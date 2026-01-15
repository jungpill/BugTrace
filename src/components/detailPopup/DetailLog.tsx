import type { ErrorRecord } from "../../type/types";
import { useViewStore } from "../../Store/useViewStore";

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
        Details
      </h3>

      <div className="flex-1 overflow-hidden space-y-4">
        {/* 1. User Actions 영역: 독립 스크롤 */}
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-gray-200">
          {/* 에러 메시지도 길어질 수 있으므로 break-all 추가 */}
          <p className="text-[14px] font-bold text-gray-900 pb-2 border-b border-gray-200 mb-3 break-all">
            {record.error.message}
          </p>

          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-gray-700">
              User Actions:
            </p>
            {/* 고정 높이와 개별 스크롤 부여 */}
            <div className="max-h-[120px] overflow-y-auto no-scrollbar">
              <ul className="list-disc list-inside text-[13px] text-gray-600 space-y-1 ml-1">
                {record.breadcrumbs?.length ? (
                  record.breadcrumbs.map((b: any, idx: number) => (
                    // User Action 텍스트가 길어질 경우에도 줄바꿈 처리 (break-all)
                    <li key={idx} className="break-all leading-snug py-0.5">
                      {b.type === "click" ? `Click: ${b.target}` : `Route: ${b.from} → ${b.to}`}
                      <span className="text-gray-400 ml-2 text-[11px] whitespace-nowrap">
                        {new Date(b.ts).toLocaleTimeString()}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="list-none text-gray-400">수집된 사용자 동작이 없습니다.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Stack Trace 영역: 독립 스크롤 및 가로 스크롤 제거 */}
        <div className="space-y-2">
          <h3 className="text-[16px] font-[500] pb-2 border-b-2 border-gray-200 shrink-0">
            Stack Trace
          </h3>
          {/* break-all 추가로 긴 문자열 강제 줄바꿈 */}
          <div className="max-h-[200px] overflow-y-auto no-scrollbar text-[12px] font-mono text-gray-600 leading-relaxed bg-white border border-gray-100 p-2 rounded whitespace-pre-wrap break-all">
            {record.error.stack || "스택 정보 없음"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailLog;