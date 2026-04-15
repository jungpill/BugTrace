import { useViewStore } from "../../Store/useViewStore";

const ErrorTrace = () => {

    const record = useViewStore((p) => p.selectedRecord);

    if(!record) return null;    

    return(
        <div className="space-y-2">
          <h3 className="text-[16px] font-[500] pb-2 border-b-2 border-gray-200 shrink-0">
            Stack Trace
          </h3>
          {/* break-all 추가로 긴 문자열 강제 줄바꿈 */}
          <div className="max-h-[200px] overflow-y-auto no-scrollbar text-[12px] font-mono text-gray-600 leading-relaxed bg-white border border-gray-100 p-2 rounded whitespace-pre-wrap break-all">
            {record.error.stack || "스택 정보 없음"}
          </div>
        </div>
    )
}

export default ErrorTrace