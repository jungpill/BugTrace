import { useViewStore } from "../../Store/useViewStore"


const ErrorContent = () => {

    const record = useViewStore((p) => p.selectedRecord);

    if(!record) return null;

    return(
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-gray-200">
          {/* 에러 메시지도 길어질 수 있으므로 break-all 추가 */}

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
    )
}

export default ErrorContent