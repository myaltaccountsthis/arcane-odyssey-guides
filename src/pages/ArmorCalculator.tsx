import { useEffect, useState } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import CheckboxGroup from "../components/CheckboxGroup";
import SliderGroup from "../components/SliderGroup";
import CopyPasteSettings from "../components/CopyPasteSettings";
import DropDown from "../components/DropDown";
import { Build, solve, updateInputs } from "../Backend.ts";
import BuildComponent from "../components/BuildComponent.tsx";
import { ArmorCalculatorSettings } from "../types/ArmorCalculatorTypes.ts";
import TextDropDown from "../components/TextDropdown.tsx";
import Button from "../components/Button.tsx";
import BrSmall from "../components/BrSmall.tsx";
import Heading from "../components/Heading.tsx";

// Stat order: power defense size intensity speed agility

const moreInfo = [
    "Armor",
    "Weights",
    "Multiplier",
    "Efficiency Points"
];
const definition = [
    "list of required armor pieces",
    "change them to prioritize certain stats",
    "estimate advantage against unarmored opponent based on pow/def and weighted secondary stats",
    "sum of build stats normalized to secondary stats using enchant ratios"
];

const tips = [
    "Secondary stat curve is based on Metapoly's real formulas",
    "Base Multiplier only considers pow/def raw multiplier",
    "Jewels and Enchants can be swapped around unless Atlantean",
    "Takes about 2000ms",
    "Solver runs faster with more restrictions"
]

function ArmorCalculator() {
    const [infoVisible, setInfoVisible] = useState(true);

    const toggleInfo = () => {
        const val = !infoVisible
        setInfoVisible(val);
        window.sessionStorage.setItem("showInfo", val ? "true" : "false");
    }

    const updateInputsLocal = () => {
        updateInputs(decimals, vit, useEfficiencyPoints, useAmulet, useSunken, useModifier, useExoticEnchants, useExoticJewels, insanity, maxDrawbacks, warding,
            [minPower, minDefense, minSize, minIntensity, minSpeed, minAgility, minRegeneration, minResistance, minArmorPiercing],
            [powerWeight, defenseWeight, sizeWeight, intensityWeight, speedWeight, agilityWeight, regenerationWeight, resistanceWeight, armorPiercingWeight]
        );
    }

    useEffect(() => {
        if (window.sessionStorage.getItem("showInfo") === "false" && infoVisible)
            toggleInfo();
    }, []);

    // Restrictions
    const [useEfficiencyPoints, setUseEfficiencyPoints] = useState(false);
    const [useSunken, setUseSunken] = useState(true);
    const [useModifier, setUseModifier] = useState(true);
    const [useAmulet, setUseAmulet] = useState(true);
    const [useExoticEnchants, setUseExoticEnchants] = useState(true);
    const [useExoticJewels, setUseExoticJewels] = useState(true);
    const restrictions = [
        { className: "use-efficiency-points", name: "Maximize Efficiency Points", isChecked: useEfficiencyPoints, onChange: setUseEfficiencyPoints },
        { className: "use-sunken", name: "Use Sunken", isChecked: useSunken, onChange: setUseSunken },
        { className: "use-modifier", name: "Use Modifier", isChecked: useModifier, onChange: setUseModifier },
        { className: "use-amulet", name: "Use Amulet", isChecked: useAmulet, onChange: setUseAmulet },
        { className: "use-exotic-enchants", name: "Use Exotic Enchants", isChecked: useExoticEnchants, onChange: setUseExoticEnchants },
        { className: "use-exotic-jewels", name: "Use Exotic Jewels", isChecked: useExoticJewels, onChange: setUseExoticJewels }
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

    // Weights
    const [powerWeight, setPowerWeight] = useState(100);
    const [defenseWeight, setDefenseWeight] = useState(100);
    const [sizeWeight, setSizeWeight] = useState(25);
    const [intensityWeight, setIntensityWeight] = useState(10);
    const [speedWeight, setSpeedWeight] = useState(50);
    const [agilityWeight, setAgilityWeight] = useState(40);
    const [regenerationWeight, setRegenerationWeight] = useState(10);
    const [resistanceWeight, setResistanceWeight] = useState(10);
    const [armorPiercingWeight, setArmorPiercingWeight] = useState(10);
    const weights = [
        { className: "power-weight", name: "Power", value: powerWeight, min: 0, max: 200, step: 1, onChange: setPowerWeight },
        { className: "defense-weight", name: "Defense", value: defenseWeight, min: 0, max: 200, step: 1, onChange: setDefenseWeight },
        { className: "size-weight", name: "Size", value: sizeWeight, min: 0, max: 200, step: 1, onChange: setSizeWeight },
        { className: "intensity-weight", name: "Intensity", value: intensityWeight, min: 0, max: 200, step: 1, onChange: setIntensityWeight },
        { className: "speed-weight", name: "Speed", value: speedWeight, min: 0, max: 200, step: 1, onChange: setSpeedWeight },
        { className: "agility-weight", name: "Agility", value: agilityWeight, min: 0, max: 200, step: 1, onChange: setAgilityWeight },
        { className: "regeneration-weight", name: "Regeneration", value: regenerationWeight, min: 0, max: 200, step: 1, onChange: setRegenerationWeight },
        { className: "resistance-weight", name: "Resistance", value: resistanceWeight, min: 0, max: 200, step: 1, onChange: setResistanceWeight },
        { className: "armor-piercing-weight", name: "Armor Piercing", value: armorPiercingWeight, min: 0, max: 200, step: 1, onChange: setArmorPiercingWeight },
    ];
    
    const [builds, setBuilds] = useState<Build[]>([]);
    const [loading, setLoading] = useState(false);
    const update = () => {
        setLoading(true);
        setBuilds([])
    }
    const clear = () => {
        setBuilds([]);
    }

    useEffect(() => {
        if (loading) {
            setTimeout(() => {
                updateInputsLocal();
                setBuilds(solve());
                setLoading(false);
            }, 50)
        }
    }, [loading]);

    const getSettings: () => {[key: string]: any} = () => {
        return {
            s: useSunken ? 1 : 0,
            a: useAmulet ? 1 : 0,
            md: useModifier ? 1 : 0,
            v: vit,
            d: decimals,
            i: insanity,
            wa: warding,
            dr: maxDrawbacks,
            min: mins.map(info => info.value),
            w: weights.map(info => info.value)
        };
    }
    const setCopyPaste = (value: ArmorCalculatorSettings) => {
        setUseSunken(value.s === 1);
        setUseAmulet(value.a === 1);
        setUseModifier(value.md === 1);
        setVit(value.v);
        setDecimals(value.d);
        setInsanity(value.i);
        setWarding(value.wa);
        setMaxDrawbacks(value.dr);
        mins.forEach((info, index) => info.onChange(value.min[index]));
        weights.forEach((info, index) => info.onChange(value.w[index]));
    }

    const settings = getSettings();
    const copyPaste = Object.keys(settings).map(key => `${key}:${JSON.stringify(settings[key])}`).join(";");

    return <div>
        <HelmetProvider>
            <Helmet>
                <title>Arcane Odyssey Armor Builds</title>
                {/* Google tag (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-YC04R7C65B"></script>
                <script>
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-YC04R7C65B');
                    `}
                </script>
            </Helmet>
        </HelmetProvider>
        <Heading>Arcane Odyssey Armor Build</Heading>
        <BrSmall />
        <div id="info">
            <div>
                Made by <b>myaltaccountsthis</b> (<a target="_blank" href="https://www.discord.gg/3GARqj2" title="myaltaccountsthis">Discord</a> | <a target="_blank" href="https://www.youtube.com/myaltaccountsthis" title="myaltaccountsthis">YouTube</a>)
            </div>
            <BrSmall />
            <div>Check the source code <a target="_blank" href="https://github.com/myaltaccountsthis/arcane-odyssey-guides">here</a></div>
            <BrSmall />
            <div><a href="/">More Guides</a></div>
        </div>
        <br />
        <DropDown title="Filters" buttonClassName="!w-[120px] !max-w-[120px]">
            <div className="flex flex-row flex-wrap justify-center w-fit max-w-[420px] lg:max-w-[840px] m-auto gap-y-4">
                <CheckboxGroup title="Restrictions" checkboxes={restrictions}/>
                <SliderGroup title="Options" sliders={options}/>
                <SliderGroup title="Mins" sliders={mins} />
                <SliderGroup title="Weights" sliders={weights} />
            </div>
        </DropDown>
        <br />
        <CopyPasteSettings settingsStr={copyPaste} setCopyPaste={setCopyPaste}/>
        <br />
        <Button onClick={update}>Update</Button>
        <BrSmall />
        <Button onClick={clear}>Clear</Button>
        <BrSmall />
        <div className="flex flex-row flex-wrap justify-center gap-[10px] m-auto w-[90%]">
            {loading && <div>Loading...</div>}
            {builds.map((build, index) => {
                return <BuildComponent key={index} build={build} />
            })}
        </div>
        <br />
        <div id="drop-downs">
            <TextDropDown title="More Info" lines={definition} boldLines={moreInfo}/>
            <br />
            <TextDropDown title="Tips" lines={tips}/>
        </div>
        <div className="h-20" />
    </div>
}

export default ArmorCalculator;