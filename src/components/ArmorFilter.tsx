import ArmorFilterArmorButton from './ArmorFilterArmorButton';

interface ArmorFilterProps {
    armorList: string[];
}

export default function ArmorFilter({armorList}: ArmorFilterProps) {
    return (
        <div className="min-w-[400px]">
            <div className="font-bold">Armor Filter</div>
            <br />
            <div className="flex items-center">
                <div className="flex flex-row flex-wrap items-center gap-2 w-1/2">
                    {armorList.map((armor, i) => (
                        <ArmorFilterArmorButton key={i} armor={armor} active={false} />
                    ))}
                </div>
                <div className="flex flex-row flex-wrap items-center gap-2 w-1/2">
                    {armorList.map((armor, i) => (
                        <ArmorFilterArmorButton key={i} armor={armor} active={false} />
                    ))}
                </div>
            </div>
        </div>
    );
}