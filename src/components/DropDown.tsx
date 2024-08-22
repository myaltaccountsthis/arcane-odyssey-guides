import {useState} from "react";

interface Props {
    title: string;
    lines: string[];
    boldLines?: string[];
}

function DropDown({ title, lines, boldLines }: Props) {
    const [active, setActive] = useState(false);
    const onClick = () => {
        setActive(!active);
    }
    
    return (
        <div className="dropdown">
            <button className="drop-button" onClick={onClick}>{title}</button>
            {active && 
                <div className="dropdown-content">
                    {lines.map((line, index) => <p key={index}><b>{boldLines && boldLines[index] + ": "}</b>{line}</p>)}
                </div>
            }
        </div>
    );

}

export default DropDown;