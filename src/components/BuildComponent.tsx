import ArmorComponent from "./ArmorComponent";
import { Build, StatOrder, statToIndex, getFormattedMultiplierStr, getBaseMult, getPowerEquivalence, getMultiplierColorStr } from "../Backend.ts";

interface Props {
    build: Build;
}

export default function BuildComponent({ build }: Props) {
    return (
        <>
            <div className="list-element">
                <div title="Multiplier of all stats, scales with weight">Multiplier: <span style={{ color: build.multiplierColorStr() }}>{getFormattedMultiplierStr(build.multiplier)}</span></div>
                <div title="Multiplier from power and defense">Base Multiplier: <span style={{color: getMultiplierColorStr(getBaseMult(build))}}>{getFormattedMultiplierStr(getBaseMult(build))}</span></div>
                <div title="Total stats, normalized to power">Power Equivalence: <span style={{color: getMultiplierColorStr(getPowerEquivalence(build) / 80)}}>{getFormattedMultiplierStr(getPowerEquivalence(build))}</span></div>
                <div>{StatOrder.map(stat => build.stats[statToIndex[stat]] > 0 && <><span className={stat}>{build.stats[statToIndex[stat]]}</span><img className="icon" src="./armor/{stat}_icon.png" /></>).join(" ")}</div>
                <div className="br-small"></div>
                <table>
                    <th>Armor</th>
                    {build.armorList.map(armor => <ArmorComponent armor={armor} />).join("")}
                </table>
            </div>
        </>
    );
}