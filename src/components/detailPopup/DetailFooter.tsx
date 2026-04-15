import { useViewStore } from "../../Store/useViewStore";
import { DefaultButton } from "../common/Button";
import Copy from '../../assets/images/icon_copy.svg'
import Download from '../../assets/images/icon_download.svg'

const DetailFooter = () => {

    const record = useViewStore((p) => p.selectedRecord);

    const handleDownloadErrorLog = () => {
    if (!record || !record.breadcrumbs || !record.error.stack) return;

    // 1. 텍스트 내용 가공
    const userAction = `=== UserAction Report ===\n`;
    const timestamp = `Generated at: ${new Date().toLocaleString()}\n`;
    const divider = `---------------------------\n\n`;
    
    const logContent = record.breadcrumbs.map((b: any) => {
        const time = new Date(b.ts).toLocaleTimeString();
        const action = b.type === "click" 
            ? `[Click] Target: ${b.target}` 
            : `[Route] ${b.from} → ${b.to}`;
        return `${time} | ${action}`;
    }).join('\n');

    const stackTrace = '\n\n=== Stack Trace ===\n';
    const stackContent = record.error.stack || "No stack trace available";

    const userActionString = userAction + timestamp + divider + logContent;
    const stackTraceString = stackTrace + divider + stackContent;


    // 2. Blob 객체 생성 (텍스트 파일 데이터)
    const blob = new Blob([userActionString, stackTraceString], { type: 'text/plain' });

    // 3. 다운로드 링크 생성 및 클릭 실행
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 설정 (예: error_log_2023-10-27.txt)
    const fileName = `error_log_${new Date().toISOString().split('T')[0]}.txt`;
    link.download = fileName;

    // 브라우저에 링크를 추가하고 클릭한 뒤 바로 제거
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 메모리 해제
    window.URL.revokeObjectURL(url);
};

    return(
        <div className="flex gap-4 w-full ">  
            <DefaultButton
            onClick={handleDownloadErrorLog}>
                <img 
                src={Download} 
                alt="export" 
                className="mr-2 h-4 w-4"
                />
                export Log
            </DefaultButton>
            <DefaultButton
            onClick={() => { console.log("로그 복사") }}>
                <img 
                src={Copy} 
                alt="copy" 
                className="mr-2 h-4 w-4"
                />
                copy Log
            </DefaultButton>
        </div>
    )
}

export default DetailFooter