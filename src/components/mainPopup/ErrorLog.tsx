import { MdKeyboardArrowRight } from "react-icons/md";
import { useViewStore } from "../../Store/useViewStore";

interface ErrorProps {
    title: string
    dateMs: number
    domain: string
}

const ErrorLog = ({
    title,
    dateMs,
    domain
    } : ErrorProps) => {

    const gotoDetail = useViewStore((p) => p.goToDetail)

    function formatRelativeTime(dateMs: number, nowMs = Date.now()) {
        const diffSec = Math.max(0, Math.floor((nowMs - dateMs) / 1000));

        if (diffSec < 10) return "방금 전";
        if (diffSec < 60) return `${diffSec}초 전`;

        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin}분 전`;

        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) return `${diffHour}시간 전`;

        const diffDay = Math.floor(diffHour / 24);
        if (diffDay < 7) return `${diffDay}일 전`;

        // 오래된 건 날짜로 보여주는 게 읽기 좋음(원하면 계속 "n일 전"으로도 가능)
        return new Date(dateMs).toLocaleDateString();
    }

    const relative = formatRelativeTime(dateMs)

    return(
        <div className="flex">
            <div className="flex flex-col gap-1 min-w-0 max-w-[80%]">
                <h3 className="text-[16px] font-[500] truncate w-70">
                    {title}
                </h3>

                <p>
                    {relative} * {domain}
                </p>
            </div>

            <div className="flex items-center justify-center w-full">
                <MdKeyboardArrowRight
                className="
                ml-auto w-7 h-7 text-gray-500 cursor-pointer rounded-xl 
                hover:bg-gray-100
                "
                onClick={gotoDetail}
                />
            </div>
        </div>
    )
}

export default ErrorLog