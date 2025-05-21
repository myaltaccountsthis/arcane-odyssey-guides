import ArmorFilterArmorButton from "./ArmorFilterArmorButton";
import BrSmall from "./BrSmall";

interface ArmorFilterListProps {
    title: string;
    armorList: string[];
    handleUpdate: (armor: string, state: boolean) => void;
}

export default function ArmorFilterList({ title, armorList, handleUpdate }: ArmorFilterListProps) {
    return (
        <div className="w-1/2">
            <b>{title}</b>
            <BrSmall />
            <div className="flex flex-row flex-wrap justify-center items-center gap-2">
                {armorList.map((armor, i) => (
                    <ArmorFilterArmorButton key={i} armor={armor} handleClick={handleUpdate} />
                ))}
            </div>
        </div>
    )
}