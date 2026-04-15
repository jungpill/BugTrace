import {useEffect, useReducer} from 'react';
import { IoIosWarning } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { useToastStore } from "../../Store/useToastStore";

const Toast = () => {

    const { type, message, clear } = useToastStore();

    useEffect(() => {
        if (type) {
            const timer = setTimeout(() => {
                clear();
            }, 3000); // 3초 후에 토스트 메시지 사라짐

            return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
        }
    }, [type, clear]);

    return (
    <div
        className={`fixed left-0 right-0 top-10 z-[1002] w-full flex items-center justify-center pointer-events-none will-change-transform will-change-opacity transition-all duration-500 ease-in-out ${
            type !== null ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'
        }`}
        >
        <div className="flex w-[75%] items-center gap-[14px] rounded-lg bg-[#33383F] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center">
            {type === 'success' && <FaCheckCircle color="#3B82F6" size={30} />}
            {type === 'error' && <IoIosWarning color="red" size={30} />}
            </div>

            <div className="text-sm font-semibold text-white">
            {message}
            </div>
        </div>
    </div>
  );
};

export default Toast;