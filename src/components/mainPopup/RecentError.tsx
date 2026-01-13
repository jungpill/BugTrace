import { useViewStore } from "../../Store/useViewStore";
import { useEffect } from "react";

const RecentError = () => {

    const records = useViewStore((p) => p.records)
    const fetchRecords = useViewStore((p) => p.fetchRecords)

    useEffect(() => {
        fetchRecords(); 
    }, []);

    return(
        <div className="flex flex-col w-full bg-[#F1F3F4] px-1">
            <div className="px-2 py-2 text-[14px] text-gray-700 font-[500]">
                Recent Errors
            </div>

            <div className="min-h-20 justify-center items-center flex flex-col rounded-b-md bg-white px-2 py-2 gap-2">
                {
                    records.length ? 
                    'no Error':
                    records.map((record, ) => {
                    return(
                        <div key={record.capturedAt}>
                            <p>{record.error.message}</p>
                        </div>
                    )
                })
                }

                <p className="text-[14px] flex">
                    확인된 에러가 없습니다.
                </p>
            </div>
        </div>
    )
}

export default RecentError;