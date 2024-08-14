import { useEffect, useState } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";

function Checkbox(props: {onChange?: () => void, checked: boolean, label: string}) {
    return <div>
        <label htmlFor={props.label}>{props.label}</label>
        <input id={props.label} name={props.label} type="checkbox" onChange={props.onChange} checked={props.checked} />
        <span></span>
    </div>
}

export default function Armor() {
    const [infoVisible, setInfoVisible] = useState(true);

    const toggleInfo = () => {
        const val = !infoVisible
        setInfoVisible(val);
        window.sessionStorage.setItem("showInfo", val ? "true" : "false");
    }

    useEffect(() => {
        if (window.sessionStorage.getItem("showInfo") === "false" && infoVisible)
            toggleInfo();
    }, []);

    return <div>
        <HelmetProvider>
            <Helmet>
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
        <h1>Arcane Odyssey Armor Build</h1>
        <button id="visibility-button" className="toggle" onClick="toggleInfo(this)">Hide Info</button>
        <br />
        <div id="info">
            <div>
                Made by <b>myaltaccountsthis</b> (<a target="_blank" href="https://www.discord.gg/3GARqj2" title="myaltaccountsthis">Discord</a> | <a target="_blank" href="https://www.youtube.com/myaltaccountsthis" title="myaltaccountsthis">YouTube</a>)
            </div>
            <br />
            <div><b>Armor:</b> list of required armor pieces</div>
            <div><b>Weights:</b> change them to prioritize certain stats</div>
            <div><b>Multiplier:</b> estimate advantage against unarmored opponent<br />based on pow/def and weighted secondary stats</div>
            <div><b>Power Equivalence:</b> sum of build stats normalized to power</div>
            <br />
            <div>Some stats (attack speed and intensity) have extra formulas to better estimate multiplier<br />based on their extra effects (subtractive startup and aura/focus)</div>
            <div>Secondary stat curve is based on Metapoly's real formulas</div>
            <div>Base Multiplier only includes pow/def raw multiplier</div>
            <div>Jewels and Enchants can be swapped around unless Atlantean</div>
            <br />
            <div>Takes about 2000ms</div>
            <div>Solver runs faster with tighter bounds</div>
            {/* <!-- <div>Log Info on will log messages in console</div> --> */}
            <div>Check the source code <a target="_blank" href="https://github.com/myaltaccountsthis/arcane-odyssey-guides">here</a></div>
            <div className="br-small"></div>
            <div><a href="index.html">More Guides</a></div>
            <div className="br-small"></div>
            <div>Use the sliders and options below to specify</div>
            <br />
        </div>
        <form onSubmit="return false">
            <datalist>
                <option value="0"></option>
                <option value="25"></option>
                <option value="50"></option>
                <option value="75"></option>
                <option value="100"></option>
            </datalist>
            <button id="filter-list-button" className="toggle" onClick="toggleIgnoreList(this)">Hide Filters</button>
            <div className="br-small"></div>
            <div id="filter-list">
                <Checkbox label="only-nonzero" checked onChange="toggleNonZero(this)" />
                <div>
                    <label htmlFor="use-sunken">Use Sunken</label>
                    <input id="use-sunken" name="use-sunken" type="checkbox" checked />
                    <span></span>
                </div>
                <div>
                    <label htmlFor="sunken-warrior">Use Sunken Warrior</label>
                    <input id="sunken-warrior" name="sunken-warrior" type="checkbox" checked />
                    <span></span>
                </div>
                <div>
                    <label htmlFor="use-amulet">Use Amulet</label>
                    <input id="use-amulet" name="use-amulet" type="checkbox" />
                    <span></span>
                </div>
                <div>
                    <label htmlFor="use-jewels">Use Jewels</label>
                    <input id="use-jewels" name="use-jewels" type="checkbox" checked />
                    <span></span>
                </div>
                <div>
                    <label htmlFor="use-modifier">Use Modifiers</label>
                    <input id="use-modifier" name="use-modifier" type="checkbox" checked />
                    <span></span>
                </div>
                <div>
                    <label htmlFor="exotic-enchant">Use Exotic Enchants</label>
                    <input id="exotic-enchant" name="exotic-enchant" type="checkbox" onChange="toggleExoticEnchant(this)" checked />
                    <span></span>
                </div>
                <div>
                    <label htmlFor="exotic-jewel">Use Exotic Jewels</label>
                    <input id="exotic-jewel" name="exotic-jewel" type="checkbox" onChange="toggleExoticJewel(this)" checked />
                    <span></span>
                </div>
                <div>
                    <label htmlFor="use-secondary">Use Secondary Stats</label>
                    <input id="use-secondary" name="use-secondary" type="checkbox" onChange="toggleSecondary(this)" checked />
                    <span></span>
                </div>
                <br />
            </div>
            <div className="slider">
                <label htmlFor="vit">Vitality</label>
                <input id="vit" onInput="vitChange(this)" name="vit" type="range" min="0" max="250" step="1" value="0" />
                <span><input className="input-text" id="vit-text" onInput="vitChange(this)" type="text" value="0" /></span>
            </div>
            <div className="slider">
                <label htmlFor="decimals">Decimal Places</label>
                <input id="decimals" onInput="decimalsChange(this)" name="decimals" type="range" min="1" max="5" step="1" value="3" />
                <span><input className="input-text" id="decimals-text" onInput="decimalsChange(this)" type="text" value="3" /></span>
            </div>
            <div className="slider">
                <label htmlFor="insanity">Insanity</label>
                <input id="insanity" onInput="insanityChange(this)" name="insanity" type="range" min="0" max="5" step="1" value="0" />
                <span><input className="input-text" id="insanity-text" onInput="insanityChange(this)" type="text" value="0" /></span>
            </div>
            <div className="slider">
                <label htmlFor="warding">Warding</label>
                <input id="warding" onInput="wardingChange(this)" name="warding" type="range" min="0" max="5" step="1" value="0" />
                <span><input className="input-text" id="warding-text" onInput="wardingChange(this)" type="text" value="0" /></span>
            </div>
            <div className="slider">
                <label htmlFor="drawback">Max Drawback</label>
                <input id="drawback" onInput="drawbackChange(this)" name="drawback" type="range" min="0" max="20" step="1" value="0" />
                <span><input className="input-text" id="drawback-text" onInput="drawbackChange(this)" type="text" value="0" /></span>
            </div>
            {/* <div>
                <label htmlFor="log">Log Info</label>
                <input id="log" name="log" type="checkbox" onChange="toggleLog(this)" checked>
                <span></span>
            </div> */}
            <br />
            <div className="big">Mins</div>
            <div>
                <div className="slider">
                    <label htmlFor="min-power">Power</label>
                    <input id="min-power" onInput="minChange(0, this)" name="min-power" type="range" min="0" max="250" step="1" value="30" />
                    <span><input className="input-text" id="min-power-text" onInput="minChange(0, this)" type="text" value="30" /></span>
                </div>
                <div className="slider">
                    <label htmlFor="min-defense">Defense</label>
                    <input id="min-defense" onInput="minChange(1, this)" name="min-defense" type="range" min="0" max="3000" step="1" value="300" />
                    <span><input className="input-text" id="min-defense-text" onInput="minChange(1, this)" type="text" value="300" /></span>
                </div>
                <div className="slider secondary">
                    <label htmlFor="min-size">Size</label>
                    <input id="min-size" onInput="minChange(2, this)" name="min-size" type="range" min="0" max="500" step="1" value="0" />
                    <span><input className="input-text" id="min-size-text" onInput="minChange(2, this)" type="text" value="0" /></span>
                </div>
                <div className="slider secondary">
                    <label htmlFor="min-intensity">Intensity</label>
                    <input id="min-intensity" onInput="minChange(3, this)" name="min-intensity" type="range" min="0" max="500" step="1" value="0" />
                    <span><input className="input-text" id="min-intensity-text" onInput="minChange(3, this)" type="text" value="0" /></span>
                </div>
                <div className="slider secondary">
                    <label htmlFor="min-speed">Speed</label>
                    <input id="min-speed" onInput="minChange(4, this)" name="min-speed" type="range" min="0" max="500" step="1" value="0" />
                    <span><input className="input-text" id="min-speed-text" onInput="minChange(4, this)" type="text" value="0" /></span>
                </div>
                <div className="slider secondary">
                    <label htmlFor="min-agility">Agility</label>
                    <input id="min-agility" onInput="minChange(5, this)" name="min-agility" type="range" min="0" max="500" step="1" value="0" />
                    <span><input className="input-text" id="min-agility-text" onInput="minChange(5, this)" type="text" value="0" /></span>
                </div>
            </div>
            <br />
            <div className="big">Weights</div>
            <div>
                <div className="slider">
                    <label htmlFor="weight-power">Power</label>
                    <input id="weight-power" onInput="weightChange(0, this)" name="weight-power" type="range" min="0" max="200" step="1" value="100" />
                    <span><input className="input-text" id="weight-power-text" onInput="weightChange(0, this)" type="text" value="100" /></span>
                </div>
                <div className="slider">
                    <label htmlFor="weight-defense">Defense</label>
                    <input id="weight-defense" onInput="weightChange(1, this)" name="weight-defense" type="range" min="0" max="200" step="1" value="100" />
                    <span><input className="input-text" id="weight-defense-text" onInput="weightChange(1, this)" type="text" value="100" /></span>
                </div>
                <div className="slider secondary">
                    <label htmlFor="weight-size">Size</label>
                    <input id="weight-size" onInput="weightChange(2, this)" name="weight-size" type="range" min="0" max="200" step="1" value="40" />
                    <span><input className="input-text" id="weight-size-text" onInput="weightChange(2, this)" type="text" value="40" /></span>
                </div>
                <div className="slider secondary">
                    <label htmlFor="weight-intensity">Intensity</label>
                    <input id="weight-intensity" onInput="weightChange(3, this)" name="weight-intensity" type="range" min="0" max="200" step="1" value="10" />
                    <span><input className="input-text" id="weight-intensity-text" onInput="weightChange(3, this)" type="text" value="10" /></span>
                </div>
                <div className="slider secondary">
                    <label htmlFor="mode-bonus">Aura Bonus</label>
                    <input id="mode-bonus" onInput="modeBonusChange(this)" name="mode-bonus" type="range" min="0" max="40" step="1" value="20" />
                    <span><input className="input-text" id="mode-bonus-text" onInput="modeBonusChange(this)" type="text" value="20" /></span>
                </div>
                <div className="slider secondary">
                    <label htmlFor="weight-speed">Speed</label>
                    <input id="weight-speed" onInput="weightChange(4, this)" name="weight-speed" type="range" min="0" max="200" step="1" value="70" />
                    <span><input className="input-text" id="weight-speed-text" onInput="weightChange(4, this)" type="text" value="70" /></span>
                </div>
                <div className="slider secondary">
                    <label htmlFor="weight-agility">Agility</label>
                    <input id="weight-agility" onInput="weightChange(5, this)" name="weight-agility" type="range" min="0" max="200" step="1" value="70" />
                    <span><input className="input-text" id="weight-agility-text" onInput="weightChange(5, this)" type="text" value="70" /></span>
                </div>
            </div>
            <br />
            <div>
                <div>Copy Paste Settings</div>
                <input className="input-text" style="width: 40%; min-width: 300px; max-width: 800px; font-family: Consolas, 'Courier New';" id="copy-paste" type="text" value="" onblur="pasteSettings(this)" />
                <input type="button" onClick="copySettings(this)" value="Copy" />
            </div>
            <br />
            <input type="button" onClick="update()" value="Update"  />
        </form>
        <br />
        <div id="armor-list"></div>
    </div>
}