import {useState} from "react";

interface Props {
    title: string;
    children: React.ReactNode;
    buttonClassName?: string;
}

export default function DropDown({ title, children, buttonClassName }: Props) {
    const [active, setActive] = useState(false);
    const onClick = () => {
        setActive(!active);
    }
    
    return (
        <div className="dropdown">
            <button className={`drop-button ${buttonClassName}`} onClick={onClick}>
                {title}
                <svg className="float-right" width={24} height={24} viewBox="0 0 100 100" fill="#0000" stroke="#000" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
                    {
                        active ? <path d="M 5 75 L 50 25 L 95 75" /> : <path d="M 5 25 L 50 75 L 95 25" />
                    }
                </svg>
            </button>
            <div className={`dropdown-wrapper${active ? " dropdown-active" : ""}`}>
                <div className="dropdown-content">
                    <br />
                    {children}
                    <br />
                </div>
            </div>
            {/* {active && 
            } */}
        </div>
    );

}