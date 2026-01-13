

const DetailLog = () => {

    return(
        <div className="flex flex-col bg-white p-2 gap-2">
            <h3 className="text-[16px] font-[500] pb-2 border-b-2 border-gray-200">
                Details
            </h3>

        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
        
        {/* 에러 메시지 & User Actions 박스 */}
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-gray-200">
          <p className="text-[14px] font-bold text-gray-900 pb-2 border-b border-gray-200 mb-3">
            Uncaught TypeError: Cannot read property 'foo' of undefined
          </p>

          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-gray-700">User Actions:</p>
            <ul className="list-disc list-inside text-[13px] text-gray-600 space-y-1 ml-1">
             
            </ul>
          </div>
        </div>

        {/* 3. Stack Trace 섹션 */}
        <div className="space-y-2">
          <h3 className="text-[15px] font-bold text-gray-800">Stack Trace</h3>
          <div className="text-[12px] font-mono text-gray-600 leading-relaxed bg-white border border-gray-100 p-2 rounded">
            
          </div>
        </div>
      </div>
        </div>
    )
}

export default DetailLog