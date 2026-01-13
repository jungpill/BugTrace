import ErrorLog from "./ErrorLog";

const RecentError = () => {

    return(
        <div className="flex flex-col w-full bg-[#F1F3F4] px-1">
            <div className="px-2 py-2 text-[14px] text-gray-700 font-[500]">
                Recent Errors
            </div>

            <div className="flex flex-col rounded-b-md bg-white px-2 py-2 gap-2">
                <ErrorLog
                    title="TypeError: Cannot read properties"
                    dateMs={Date.now() - 20000 * 1000}
                    domain="dd"
                />

                <ErrorLog
                    title="TypeError: Cannot read properties"
                    dateMs={Date.now() - 20000 * 1000}
                    domain="dd"
                />

                <ErrorLog
                    title="TypeError: Cannot read properties"
                    dateMs={Date.now() - 20000 * 1000}
                    domain="dd"
                />

                
            </div>
        </div>
    )
}

export default RecentError;