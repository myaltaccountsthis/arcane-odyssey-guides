import { useRef, useState } from "react";
import { getImageSrc, islandInfo, islandNames } from "../pages/Treasure";

const IMAGE_SIZE = 144;

interface IslandOptionProps {
    islandName: string;
    onClick: () => void;
    onFocus: () => void;
    selected: boolean;
}

const seaColors: {[key: string]: string} = {
    Bronze: "rgb(205, 127, 50)",
    Nimbus: "rgb(200, 200, 200)"
};

function IslandOption({ islandName, onClick, onFocus, selected }: IslandOptionProps) {
    const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => e.key === "Enter" ? onClick() : e.key.length === 1 && onFocus();
    return (
        <div onKeyDown={onKeyDown} onMouseDown={(e) => { onClick(); e.preventDefault() }} className={`cursor-default p-1 h-min transition-colors duration-100 border-2 border-solid ${selected ? "!border-black border-[3px]" : ""}`} style={{borderColor: seaColors[islandInfo[islandName].sea]}} tabIndex={0}>
            <div style={{maxWidth: IMAGE_SIZE}} className="text-sm text-nowrap text overflow-visible text-center mb-1">{islandName}</div>
            <img className="block" src={getImageSrc(islandName)} width={IMAGE_SIZE} height={IMAGE_SIZE} />
        </div>
    )
}

interface TreasureIslandPickerProps {
    selectedIsland: string;
    onUpdate: (selectedIsland: string) => void;
}

export default function TreasureIslandPicker({ selectedIsland, onUpdate }: TreasureIslandPickerProps) {
    const [searchStr, setSearchStr] = useState("");
    const validIslands = islandNames.filter(name => name.toLowerCase().includes(searchStr.toLowerCase()));
    if (validIslands.length === 1)
        onUpdate(validIslands[0]);
    const searchBarRef = useRef<HTMLInputElement>(null);
    const onFocus = () => searchBarRef.current?.focus();

    return (
        <div>
            <div>Island Name</div>
            <input ref={searchBarRef} type="text" value={searchStr} onChange={e => setSearchStr(e.target.value)} />
            <div className="mt-4 rounded-sm pr-2 pl-4 flex flex-row flex-wrap w-[60%] m-auto gap-x-4 gap-y-4 justify-center overflow-y-scroll h-[400px]">
                {
                    validIslands.length > 0 ?
                        validIslands.map(islandName => <IslandOption key={islandName} islandName={islandName} onClick={() => onUpdate(islandName)} onFocus={onFocus} selected={islandName === selectedIsland} />) :
                        <div className="text-sm">No matching islands</div>
                }
            </div>
        </div>
    )
}