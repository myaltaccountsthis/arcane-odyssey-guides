interface SVGArrowProps {
    onClick: () => void;
    children: React.ReactNode;
}

interface SVGArrowDirectionProps {
    onClick: () => void;
}

export function SVGArrow({ onClick, children }: SVGArrowProps) {
    return <button className="border-2 p-0 bg-transparent hover:bg-gray-50 hover:cursor-pointer hover:border-gray-600 hover:shadow rounded-full border-solid border-transparent active:border-black border-opacity-0 transition-all duration-100 active:bg-gray-200 active:border-opacity-100" onClick={onClick}>
        <svg className="align-middle p-2" width={24} height={24} viewBox="0 0 100 100" fill="#0000" stroke="#000" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    </button>
}

export function SVGArrowLeft({ onClick }: SVGArrowDirectionProps) {
    return (
        <SVGArrow onClick={onClick}>
            <path d="M 70 5 L 20 50 L 70 95" />
        </SVGArrow>
    )
}

export function SVGArrowRight({ onClick }: SVGArrowDirectionProps) {
    return (
        <SVGArrow onClick={onClick}>
            <path d="M 30 5 L 80 50 L 30 95" />
        </SVGArrow>
    )
}