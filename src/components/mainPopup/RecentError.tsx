import { useViewStore } from "../../Store/useViewStore";
import { useEffect } from "react";
import { IoIosArrowForward } from "react-icons/io";
import ErrorLog from "./ErrorLog";

const RecentError = () => {

  const gotoDetail = useViewStore((p) => p.goToDetail)
  const records = useViewStore((p) => p.records);
  const fetchRecords = useViewStore((p) => p.fetchRecords);

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#F1F3F4]">
      <div className="px-2 py-2 text-[14px] text-gray-700 font-[500]">
        Recent Errors
      </div>

      <div className="min-h-20 justify-center items-center flex flex-col rounded-b-md bg-white px-2 py-2 gap-2">
        {records.length > 0 ? (
          // 에러가 있을 때 리스트를 보여줌
          records.map((record) => (
            <div 
              key={record.id} 
              className="flex w-full p-2 border-b last:border-0"
            >
              <ErrorLog
              title={record.error.message}
              dateMs={Number(new Date(record.capturedAt))}
              domain={record.host}
              record={record}
              />
            </div>
          ))
        ) : (
          // 에러가 없을 때 메시지
          <p className="text-[14px] text-gray-400 py-4">확인된 에러가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default RecentError