import {useState} from "react";
import Button from "./Button";
import BrSmall from "./BrSmall";

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
        <div>
            <Button className={`!p-2 w-1/2 max-w-[800px] ${buttonClassName}`} onClick={onClick}>
                {title}
                <svg className="float-right" width={24} height={24} viewBox="0 0 100 100" fill="#0000" stroke="#000" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
                    {
                        active ? <path d="M 5 75 L 50 25 L 95 75" /> : <path d="M 5 25 L 50 75 L 95 25" />
                    }
                </svg>
            </Button>
            <BrSmall />            
            <div className={`rounded-md m-auto w-fit grid transition-all duration-300 border-2 border-black border-solid ${active ? "p-6 grid-rows-[1fr] border-opacity-100" : "grid-rows-[0fr] border-opacity-0"}`}>
                <div className="overflow-hidden">
                    {children}
                </div>
            </div>
            {/* {active && 
            } */}
        </div>
    );

}