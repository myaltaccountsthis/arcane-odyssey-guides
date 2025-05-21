import ArmorComponent from "./ArmorComponent";
import { Build, StatOrder, statToIndex, getFormattedNumberStr, getMultiplierColorStr, getNormalizedStats, getEfficiencyPointsColorStr } from "../Backend.ts";
import Stat from "./Stat.tsx";
import BrSmall from "./BrSmall.tsx";

interface Props {
    build: Build;
    decimals: number;
}

export default function BuildComponent({ build, decimals }: Props) {
    return (
        <div className="border-2 border-solid border-black rounded-lg px-4 py-2 w-fit">
            <div title="Multiplier of all stats, scales with weight" className="cursor-help mx-auto size-fit">Multiplier: <span style={{ color: getMultiplierColorStr(build.multiplier) }}>{getFormattedNumberStr(build.multiplier, decimals)}</span></div>
            <div title="Multiplier from power and defense" className="cursor-help mx-auto size-fit">Base Multiplier: <span style={{color: getMultiplierColorStr(build.baseMultiplier)}}>{getFormattedNumberStr(build.baseMultiplier, decimals)}</span></div>
            <div title="Total stats, normalized to power" className="cursor-help mx-auto size-fit">Efficiency Points: <span style={{color: getEfficiencyPointsColorStr(getNormalizedStats(build.stats) / 80)}}>{getFormattedNumberStr(getNormalizedStats(build.stats), decimals)}</span></div>
            <div className="flex flex-row justify-center gap-x-1">{StatOrder.map(stat => build.stats[statToIndex[stat]] != 0 && <Stat key={statToIndex[stat]} index={statToIndex[stat]} value={build.stats[statToIndex[stat]]} />)}</div>
            <BrSmall />
            <div>
                <div className="font-bold">Armor</div>
                <div className="flex flex-col items-center gap-y-2">
                    {build.armorList.map((armor, i) => <ArmorComponent key={i} armor={armor} />)}
                </div>
            </div>
        </div>
    );
}