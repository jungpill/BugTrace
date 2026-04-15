import {useEffect} from 'react';
import { IoIosWarning } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";

const Toast = () => {

  

  useEffect(() => {
    if (type === null) return;

    const id = setTimeout(() => {
      clear();
    }, 2500);

    return () => clearTimeout(id);
  }, [type, clear]);

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-[1002] flex items-center justify-center pointer-events-none will-change-transform will-change-opacity transition-all duration-500 ease-in-out ${
        type !== null ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'
      }`}
    >
      <div className="flex w-[480px] items-center gap-[14px] rounded-lg bg-[#33383F] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center">
          {type === 'success' && <FaCheckCircle color="#3B82F6" size={30} />}
          {type === 'warn' && <IoIosWarning color="red" size={30} />}
        </div>

        <div className="text-sm font-semibold text-white">
          {message}
        </div>
      </div>
    </div>
  );
};

export default Toast;