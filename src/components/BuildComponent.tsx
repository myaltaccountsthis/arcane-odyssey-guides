import ArmorComponent from "./ArmorComponent";
import { Build, StatOrder, statToIndex, getFormattedMultiplierStr, getBaseMult, getMultiplierColorStr, getNormalizedStats, getEfficiencyPointsColorStr, getFormattedEfficiencyPointsStr } from "../Backend.ts";
import Stat from "./Stat.tsx";
import BrSmall from "./brsmall.tsx";

interface Props {
    build: Build;
}

export default function BuildComponent({ build }: Props) {
    return (
        <div className="border-2 border-solid border-black rounded-lg px-4 py-2 w-fit">
            <div title="Multiplier of all stats, scales with weight">Multiplier: <span style={{ color: build.multiplierColorStr() }}>{getFormattedMultiplierStr(build.multiplier)}</span></div>
            <div title="Multiplier from power and defense">Base Multiplier: <span style={{color: getMultiplierColorStr(getBaseMult(build))}}>{getFormattedMultiplierStr(getBaseMult(build))}</span></div>
            <div title="Total stats, normalized to power">Efficiency Points: <span style={{color: getEfficiencyPointsColorStr(getNormalizedStats(build.stats) / 80)}}>{getFormattedEfficiencyPointsStr(getNormalizedStats(build.stats))}</span></div>
            <div className="flex flex-row justify-center gap-x-1">{StatOrder.map(stat => build.stats[statToIndex[stat]] > 0 && <Stat key={statToIndex[stat]} index={statToIndex[stat]} value={build.stats[statToIndex[stat]]} />)}</div>
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