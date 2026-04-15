import { useViewStore } from "../../Store/useViewStore";
import { DefaultButton } from "../common/Button";
import Copy from '../../assets/images/icon_copy.svg'
import Download from '../../assets/images/icon_download.svg'
import { useToastStore } from "../../Store/useToastStore";


const DetailFooter = () => {

    const record = useViewStore((p) => p.selectedRecord);
    const { showToast } = useToastStore();

    const handleDownloadErrorLog = () => {
    // 데이터가 없으면 중단
    if (!record || !record.breadcrumbs || !record.error.stack) return;

    try {
        // 1. 텍스트 내용 가공 (기존 로직 유지)
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

        // 2. Blob 객체 생성
        const blob = new Blob([userActionString, stackTraceString], { type: 'text/plain' });

        // 3. 다운로드 링크 생성 및 클릭 실행
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const fileName = `error_log_${new Date().toISOString().split('T')[0]}.txt`;
        link.download = fileName;

        document.body.appendChild(link);
        link.click(); // 다운로드 트리거
        document.body.removeChild(link);

        // 메모리 해제
        window.URL.revokeObjectURL(url);

        // --- 성공 토스트 알림 ---
        showToast('success', 'Logs downloaded successfully!');

    } catch (err) {
        // --- 실패 시 에러 처리 및 토스트 알림 ---
        console.error('Failed to download logs:', err);
        showToast('error', 'Failed to download logs. Please try again.');
    }
};

    const handleCopyLogs = () => {
        if (!record || !record.breadcrumbs || !record.error.stack) return;

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

        const fullLogString = userAction + timestamp + divider + logContent + stackTrace + divider + stackContent;

        // 클립보드에 텍스트 복사
        navigator.clipboard.writeText(fullLogString)
            .then(() => {
                showToast('success', 'Logs copied to clipboard!');
            })
            .catch((err) => {
                console.error('Failed to copy logs: ', err);
                alert('Failed to copy logs. Please try again.');
            });
    }

    return(
        <div className="flex gap-4 w-full ">  
            <DefaultButton
            onClick={handleDownloadErrorLog}>
                <img 
                src={Download} 
                alt="export" 
                className="mr-2 h-4 w-4"
                />
                Download Logs
            </DefaultButton>
            <DefaultButton
            onClick={handleCopyLogs}>
                <img 
                src={Copy} 
                alt="copy" 
                className="mr-2 h-4 w-4"
                />
                Copy Logs
            </DefaultButton>
        </div>
    )
}

export default DetailFooter