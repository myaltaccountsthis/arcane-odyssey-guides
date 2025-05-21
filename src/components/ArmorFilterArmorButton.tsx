interface ArmorFilterArmorButtonProps {
    armor: string;
    active: boolean;
}

export default function ArmorFilterArmorButton({ armor, active }: ArmorFilterArmorButtonProps) {

    const onClick = () => {
        // Handle the click event here
        console.log(`Clicked on armor: ${armor}`);
    }

    return (
        <button className={`min-w-24 w-1/2 lg:w-[120px] h-24 flex flex-row items-center gap-x-2 rounded-lg px-2 py-1 ${active ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`} onClick={onClick}>
            {/* <img src={armor.icon} alt={armor.name} className="w-8 h-8" /> */}
            <div className="mx-auto">
                {armor}
            </div>
        </button>
    )
}