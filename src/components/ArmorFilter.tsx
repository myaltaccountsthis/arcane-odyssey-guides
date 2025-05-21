import ArmorFilterList from './ArmorFilterList';
import DropDown from './DropDown';

interface ArmorFilterProps {
    armorList: string[];
    updateInclude: (armor: string, state: boolean) => void;
    updateExclude: (armor: string, state: boolean) => void;
}

export default function ArmorFilter({armorList, updateInclude, updateExclude}: ArmorFilterProps) {
    return (
        <DropDown title="Armor Filters" buttonClassName="!w-[180px]">
            <div className="flex flex-row flex-wrap justify-center w-fit max-w-[420px] lg:max-w-[840px] m-auto gap-y-4">
                <div className="min-w-[400px]">
                    <div className="font-bold">Armor Filter</div>
                    <br />
                    <div className="flex items-center">
                        <ArmorFilterList title="Include Armor" armorList={armorList} handleUpdate={updateInclude} />
                        <ArmorFilterList title="Exclude Armor" armorList={armorList} handleUpdate={updateExclude} />
                    </div>
                </div>
            </div>
        </DropDown>
    );
}