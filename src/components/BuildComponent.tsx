import ArmorComponent from "./ArmorComponent";
import { Build, StatOrder, statToIndex, getFormattedMultiplierStr, getBaseMult, getMultiplierColorStr, getNormalizedStats, getEfficiencyPointsColorStr, getFormattedEfficiencyPointsStr } from "../Backend.ts";
import Stat from "./Stat.tsx";

interface Props {
    build: Build;
}

export default function BuildComponent({ build }: Props) {
    return (
        <>
            <div className="list-element">
                <div title="Multiplier of all stats, scales with weight">Multiplier: <span style={{ color: build.multiplierColorStr() }}>{getFormattedMultiplierStr(build.multiplier)}</span></div>
                <div title="Multiplier from power and defense">Base Multiplier: <span style={{color: getMultiplierColorStr(getBaseMult(build))}}>{getFormattedMultiplierStr(getBaseMult(build))}</span></div>
                <div title="Total stats, normalized to power">Efficiency Points: <span style={{color: getEfficiencyPointsColorStr(getNormalizedStats(build.stats) / 80)}}>{getFormattedEfficiencyPointsStr(getNormalizedStats(build.stats))}</span></div>
                <div>{StatOrder.map(stat => build.stats[statToIndex[stat]] > 0 && <Stat key={statToIndex[stat]} index={statToIndex[stat]} value={build.stats[statToIndex[stat]]} />)}</div>
                <div className="br-small" />
                <div>
                    <h3>Armor</h3>
                    {build.armorList.map((armor, i) => <ArmorComponent key={i} armor={armor} />)}
                </div>
            </div>
        </>
    );
}