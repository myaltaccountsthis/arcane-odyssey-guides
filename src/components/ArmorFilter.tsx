import { useState } from 'react';
import ArmorFilterArmorButton from './ArmorFilterArmorButton';
import BrSmall from './BrSmall';
import DropDown from './DropDown';
import { ArmorState } from '../types/ArmorCalculatorTypes';

interface ArmorFilterProps {
    armorList: string[];
    updateState: (armor: string, state: ArmorState) => void;
}

export default function ArmorFilter({armorList, updateState}: ArmorFilterProps) {
    const [mode, setMode] = useState<'include' | 'exclude'>('include');
    return (
        <DropDown title="Armor Filters" buttonClassName="!w-[180px]">
            <div className="flex flex-row flex-wrap justify-center w-fit max-w-[420px] lg:max-w-[840px] m-auto gap-y-4">
                <div className="min-w-[400px]">
                    <div className="font-bold">Armor Filter</div>
                    <br />
                    <div className="flex flex-row justify-center gap-x-2">
                        <button onClick={() => setMode('include')} className={`border-solid rounded-md hover:cursor-pointer p-1 ${mode == 'include' ? "bg-green-500 hover:bg-green-600" : "hover:bg-gray-300"}`}>Include</button>
                        <button onClick={() => setMode('exclude')} className={`border-solid rounded-md hover:cursor-pointer p-1 ${mode == 'exclude' ? "bg-red-500 hover:bg-red-600" : "hover:bg-gray-300"}`}>Exclude</button>
                    </div>
                    <BrSmall />
                    <div className="flex flex-row flex-wrap justify-center items-center w-full gap-2">
                        {armorList.map((armor, i) => (
                            <ArmorFilterArmorButton key={i} armor={armor} handleClick={updateState} mode={mode}/>
                        ))}
                    </div>
                </div>
            </div>
        </DropDown>
    );
}