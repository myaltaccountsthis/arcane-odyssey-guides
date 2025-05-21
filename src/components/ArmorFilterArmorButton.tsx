import { useState } from "react";

interface ArmorFilterArmorButtonProps {
    armor: string;
    handleClick: (armor: string, state: boolean) => void;
}

export default function ArmorFilterArmorButton({ armor, handleClick }: ArmorFilterArmorButtonProps) {
    const [active, setActive] = useState(false);
    const onClick = () => {
        handleClick(armor, !active);
        setActive(!active);
    }

    return (
        <button className={`min-w-24 w-1/2 lg:w-[120px] h-24 flex flex-row items-center gap-x-2 rounded-lg px-2 py-1 border-solid ${active ? "border-blue-500" : "border-black"} hover:bg-gray-200 hover:cursor-pointer active:bg-gray-300`} onClick={onClick}>
            {/* <img src={armor.icon} alt={armor.name} className="w-8 h-8" /> */}
            <div className="mx-auto text-xs">
                {armor}
            </div>
        </button>
    )
}