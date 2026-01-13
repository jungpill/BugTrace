

interface ToggleProps {
    active: boolean;
    onToggle: () => void;
}

const Toggle = ({
    active,
    onToggle
}: ToggleProps) => {

    return(
        <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
                type="checkbox"
                name="toggle"
                id="toggle"
                checked={active}
                onChange={onToggle}
                className="sr-only"
            />
            <label
                htmlFor="toggle"
                className={`block h-6 w-10 rounded-full cursor-pointer ${active ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
                <span
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform ${active ? 'translate-x-4' : ''}`}
                ></span>
            </label>
        </div>
    )
}
export default Toggle;