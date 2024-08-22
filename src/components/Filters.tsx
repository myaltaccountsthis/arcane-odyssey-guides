import { useState } from "react";
import SliderGroup from "./SliderGroup";
import CheckboxGroup from "./CheckboxGroup";

export default function Filters() {
    const [active, setActive] = useState(true);
    const onClick = () => {
        setActive(!active);
    };

    // Restrictions
    const [useSunken, setUseSunken] = useState(true);
    const [useModifier, setUseModifier] = useState(true);
    const restrictions = [
        { className: "use-sunken", name: "Use Sunken", value: useSunken, setValue: setUseSunken },
        { className: "use-modifier", name: "Use Modifier", value: useModifier, setValue: setUseModifier },
    ];

    // Options
    const [vit, setVit] = useState(0);
    const [decimals, setDecimals] = useState(3);
    const [insanity, setInsanity] = useState(0);
    const [warding, setWarding] = useState(0);
    const [maxDrawbacks, setMaxDrawbacks] = useState(0);
    const options = [
        { className: "vit", name: "Vitality", value: vit, min: 0, max: 250, step: 1, onChange: setVit },
        { className: "decimals", name: "Decimals", value: decimals, min: 1, max: 5, step: 1, onChange: setDecimals },
        { className: "insanity", name: "Insanity", value: insanity, min: 0, max: 5, step: 1, onChange: setInsanity },
        { className: "warding", name: "Warding", value: warding, min: 0, max: 5, step: 1, onChange: setWarding },
        { className: "drawback", name: "Max Drawback", value: maxDrawbacks, min: 0, max: 20, step: 1, onChange: setMaxDrawbacks },
    ];
    
    // Mins
    const minStats = ["power", "defense", "size", "intensity", "speed", "agility", "regeneration", "resistance", "armor-piercing"];
    const [minPower, setMinPower] = useState(0);
    const [minDefense, setMinDefense] = useState(0);
    const [minSize, setMinSize] = useState(0);
    const [minIntensity, setMinIntensity] = useState(0);
    const [minSpeed, setMinSpeed] = useState(0);
    const [minAgility, setMinAgility] = useState(0);
    const [minRegeneration, setMinRegeneration] = useState(0);
    const [minResistance, setMinResistance] = useState(0);
    const [minArmorPiercing, setMinArmorPiercing] = useState(0);
    const mins = [
        { className: "min-power", name: "Power", value: minPower, min: 0, max: 350, step: 1, onChange: setMinPower },
        { className: "min-defense", name: "Defense", value: minDefense, min: 0, max: 3500, step: 1, onChange: setMinDefense },
        { className: "min-size", name: "Size", value: minSize, min: 0, max: 650, step: 1, onChange: setMinSize },
        { className: "min-intensity", name: "Intensity", value: minIntensity, min: 0, max: 650, step: 1, onChange: setMinIntensity },
        { className: "min-speed", name: "Speed", value: minSpeed, min: 0, max: 650, step: 1, onChange: setMinSpeed },
        { className: "min-agility", name: "Agility", value: minAgility, min: 0, max: 650, step: 1, onChange: setMinAgility },
        { className: "min-regeneration", name: "Regeneration", value: minRegeneration, min: 0, max: 650, step: 1, onChange: setMinRegeneration },
        { className: "min-resistance", name: "Resistance", value: minResistance, min: 0, max: 650, step: 1, onChange: setMinResistance },
        { className: "min-armor-piercing", name: "Armor Piercing", value: minArmorPiercing, min: 0, max: 650, step: 1, onChange: setMinArmorPiercing },
    ];

    return (
        <>
            <button id="filter-list-button" className="toggle" onClick={onClick}>{active ? "Hide Filters" : "Show Filters"}</button>
            {active &&
                <div>
                    <CheckboxGroup title="Restrictions" checkboxes={restrictions}/>
                    <SliderGroup title="Options" sliders={options}/>
                    <SliderGroup title="Mins" sliders={mins} />
                </div>
            }
        </>
    );
}