
interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
}

export const DefaultButton = ({ children, onClick }: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="
            bg-[#fff] text-[#6B7280] rounded hover:bg-[#F3F4F6]
            px-4 py-2 text-sm font-medium border-radius-md border border-gray-400
            flex items-center justify-center cursor-pointer
            "
        >
            {children}
        </button>
    );
}