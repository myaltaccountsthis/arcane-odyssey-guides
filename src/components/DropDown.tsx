import {useState} from "react";
import Button from "./Button";
import BrSmall from "./brsmall";

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
            <div className={`rounded-md m-auto w-7/12 max-w-[900px] px-4 grid transition-[grid-template-rows] dropdown-wrapper ${active ? "grid-rows-[1fr] border-2 border-black border-solid" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
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