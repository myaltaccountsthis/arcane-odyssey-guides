import { useState } from "react";
import { ArmorState } from "../types/ArmorCalculatorTypes";

interface ArmorFilterArmorButtonProps {
    armor: string;
    mode: 'include' | 'exclude';
    handleClick: (armor: string, state: ArmorState) => void;
}

export default function ArmorFilterArmorButton({ armor, mode, handleClick }: ArmorFilterArmorButtonProps) {
    const [state, setState] = useState<ArmorState>('none');
    const onClick = () => {
        let newState: ArmorState = 'none';
        if (mode == state) {
            newState = 'none';
        } else {
            newState = mode;
        }
        handleClick(armor, newState);
        setState(newState);
    }

    return (
        <button className={`min-w-24 w-1/2 lg:w-[120px] h-24 flex flex-row items-center gap-x-2 rounded-lg px-2 py-1 border-solid ${state == 'include' ? "border-green-600" : state == 'exclude' ? "border-red-600" : "border-black"} hover:bg-gray-200 hover:cursor-pointer active:bg-gray-300`} onClick={onClick}>
            {/* <img src={armor.icon} alt={armor.name} className="w-8 h-8" /> */}
            <div className="mx-auto text-xs">
                {armor}
            </div>
        </button>
    )
}