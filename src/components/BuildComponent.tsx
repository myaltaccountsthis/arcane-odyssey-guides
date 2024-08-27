import ArmorComponent from "./ArmorComponent";
import { Build, StatOrder, statToIndex, getFormattedMultiplierStr, getBaseMult, getMultiplierColorStr, getNormalizedStats } from "../Backend.ts";

interface Props {
    build: Build;
}

export default function BuildComponent({ build }: Props) {
    return (
        <>
            <div className="list-element">
                <div title="Multiplier of all stats, scales with weight">Multiplier: <span style={{ color: build.multiplierColorStr() }}>{getFormattedMultiplierStr(build.multiplier)}</span></div>
                <div title="Multiplier from power and defense">Base Multiplier: <span style={{color: getMultiplierColorStr(getBaseMult(build))}}>{getFormattedMultiplierStr(getBaseMult(build))}</span></div>
                <div title="Total stats, normalized to power">Efficiency Points: <span style={{color: getMultiplierColorStr(getNormalizedStats(build.stats) / 80)}}>{getFormattedMultiplierStr(getNormalizedStats(build.stats))}</span></div>
                <div>{StatOrder.map(stat => build.stats[statToIndex[stat]] > 0 && <><span className={stat}>{build.stats[statToIndex[stat]]}</span><img className="icon" src="./armor/{stat}_icon.png" /></>).join(" ")}</div>
                <div className="br-small"></div>
                <div>
                    <h3>Armor</h3>
                    {build.armorList.map(armor => <ArmorComponent armor={armor} />).join("")};
                </div>
            </div>
        </>
    );
}