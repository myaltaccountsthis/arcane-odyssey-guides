interface ButtonProps {
    className?: string;
    onClick: () => void;
    children: React.ReactNode;
}

export default function Button({ className, onClick, children }: ButtonProps) {
    return (
        <button
            className={`border-2 border-black border-solid rounded-md px-2 py-1 bg-gray-100 hover:bg-gray-200 hover:scale-[1.03] hover:cursor-pointer hover:shadow-md active:bg-gray-300 transition-all duration-100 ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}