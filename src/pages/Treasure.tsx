import { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import DropDown from "../components/DropDown";
import BrSmall from "../components/BrSmall";
import Heading from "../components/Heading";
import LeftRightControls from "../components/LeftRightControls";
import paths from "../PathStuff";
import TreasureIslandPicker from "../components/TreasureIslandPicker";
import Checkbox from "../components/Checkbox";

const directionNames = [
    "East", "East Southeast", "Southeast", "South Southeast",
    "South", "South Southwest", "Southwest", "West Southwest",
    "West", "West Northwest", "Northwest", "North Northwest",
    "North", "North Northeast", "Northeast", "East Northeast"
];
const distanceNames = ["Few paces", "Halfway", "On the edge"];
export const islandNames = [
    "Frostmill Island", "Ravenna", "Forest of Cernunno", "Shell Island",
    "Harvest Island", "Whitesummit", "Munera Garden", "Wind-Row Island",
    "Palo Town", "Blasted Rock", "Thorin's Refuge", "Limestone Key",
    "Akursius Keep", "Blackreach Island", "Thrylos Crossing", "Cedar Arch", "Ierochos",
    "Sameria", "Shale Reef", "Drakos Arch", "Claw Island", "Makrinaos",
    // "Silverhold"
];
export type Sea = "Bronze" | "Nimbus";
export const islandInfo: {[key: string]: {sea: Sea}} = {
    "Frostmill Island": {
        sea: "Bronze"
    },
    "Ravenna": {
        sea: "Bronze"
    },
    "Forest of Cernunno": {
        sea: "Bronze"
    },
    "Shell Island": {
        sea: "Bronze"
    },
    "Harvest Island": {
        sea: "Bronze"
    },
    "Whitesummit": {
        sea: "Bronze"
    },
    "Munera Garden": {
        sea: "Bronze"
    },
    "Wind-Row Island": {
        sea: "Bronze"
    },
    "Palo Town": {
        sea: "Bronze"
    },
    "Blasted Rock": {
        sea: "Bronze"
    },
    "Thorin's Refuge": {
        sea: "Bronze"
    },
    "Limestone Key": {
        sea: "Bronze"
    },
    "Akursius Keep": {
        sea: "Bronze"
    },
    "Blackreach Island": {
        sea: "Bronze"
    },
    "Thrylos Crossing": {
        sea: "Bronze"
    },
    "Cedar Arch": {
        sea: "Bronze"
    },
    "Ierochos": {
        sea: "Bronze"
    },
    "Sameria": {
        sea: "Nimbus"
    },
    "Shale Reef": {
        sea: "Nimbus"
    },
    "Drakos Arch": {
        sea: "Nimbus"
    },
    "Claw Island": {
        sea: "Nimbus"
    },
    "Makrinaos": {
        sea: "Nimbus"
    },
}

const RADIUS = 256;

// angle goes clockwise starting from the x-axis
function get2DComponents(angle: number, radius: number) {
    return {x: RADIUS + radius * Math.cos(angle), y: RADIUS + radius * Math.sin(angle)};
}

export function getImageSrc(selectedIsland: string) {
    return `${paths.treasure}${selectedIsland}.png`;
}

export default function Treasure() {
    const [directionIndex, setDirectionIndex] = useState(0);
    const [distanceIndex, setDistanceIndex] = useState(0);
    const [selectedIsland, setSelectedIsland] = useState("Ravenna");
    const [imageSrc, setImageSrc] = useState("");
    const [showGrid, setShowGrid] = useState(true);

    const updateImageSrc = () => {
        setImageSrc(getImageSrc(selectedIsland));
    }
    useEffect(() => {
        window.sessionStorage.setItem("direction", directionIndex.toString());
        window.sessionStorage.setItem("distance", distanceIndex.toString());
        window.sessionStorage.setItem("island", selectedIsland);
        updateImageSrc();
    }, [directionIndex, distanceIndex, selectedIsland]);
    
    const angle = Math.PI * directionIndex / 8;
    const a1 = angle - Math.PI / 16, a2 = angle + Math.PI / 16
    const r1 = distanceIndex * RADIUS / 3, r2 = r1 + RADIUS / 3;
    const {x: xL1, y: yL1} = get2DComponents(a1, r1);
    const {x: xL2, y: yL2} = get2DComponents(a1, r2);
    const {x: xU1, y: yU1} = get2DComponents(a2, r1);
    const {x: xU2, y: yU2} = get2DComponents(a2, r2);

    const directionLeft = () => setDirectionIndex((directionIndex + directionNames.length - 1) % directionNames.length);
    const directionRight = () => setDirectionIndex((directionIndex + 1) % directionNames.length);
    const distanceLeft = () => setDistanceIndex((distanceIndex + distanceNames.length - 1) % distanceNames.length);
    const distanceRight = () => setDistanceIndex((distanceIndex + 1) % distanceNames.length);

    const toggleGrid = () => {
        const val = !showGrid
        setShowGrid(val);
        window.sessionStorage.setItem("showGrid", val ? "true" : "false");
    }
    
    useEffect(() => {
        if (window.sessionStorage.getItem("direction")) {
            setDirectionIndex(parseInt(window.sessionStorage.getItem("direction")!));
            setDistanceIndex(parseInt(window.sessionStorage.getItem("distance")!));
            setSelectedIsland(window.sessionStorage.getItem("island")!);
        }
        if (window.sessionStorage.getItem("showGrid") === "false" && showGrid)
            toggleGrid();
    }, []);

    return <div>
        <Heading>Arcane Odyssey Treasure Chart Locator</Heading>
        <HelmetProvider>
            <Helmet>
                {/* Google tag (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-93FL9QKY9W"></script>
                <script>
                    {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-93FL9QKY9W');
                    `}
                </script>
            </Helmet>
        </HelmetProvider>
        <br />
        <DropDown title="Info" buttonClassName="!w-[120px] !m-w-[120px]">
            <>
                <div>
                    Made by <b>myaltaccountsthis</b> (<a target="_blank" href="https://www.discord.gg/3GARqj2" title="myaltaccountsthis">Discord</a> | <a target="_blank" href="https://www.youtube.com/myaltaccountsthis" title="myaltaccountsthis">YouTube</a>)
                </div>
                <div><b>Treasure is determined by each part (block of land)</b></div>
                <div>You only have to dig in each individual part once to check</div>
                <div>Zoom in (ctrl+ or ctrl scrollwheel) to enlarge the map</div>
                <div><b>This list does not include very small islands</b></div>
                <div>Some maps may be slightly off, please dm me on discord</div>
                <div>Check the source code <a target="_blank" href="https://github.com/myaltaccountsthis/arcane-odyssey-guides">here</a></div>
                <BrSmall />
                <div><a href="../">More Guides</a></div>
            </>
        </DropDown>
        <br/>
        <div>
            <LeftRightControls onLeft={directionLeft} onRight={directionRight}>{directionNames[directionIndex]}</LeftRightControls>
            <LeftRightControls onLeft={distanceLeft} onRight={distanceRight}>{distanceNames[distanceIndex]}</LeftRightControls>
            <Checkbox className="show-grid" name="Show Grid" isChecked={showGrid} onChange={toggleGrid} />
        </div>
        <br/>
        <div>
            <svg id="viewport" viewBox="0 0 512 512" width={512} height={512} stroke="rgba(0, 0, 0, 1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <image href={imageSrc} width={512} height={512} />
                { showGrid &&
                    <g fill="none" stroke="rgba(0, 0, 0, .6)">
                        {
                            Array(16).fill(0).map((_, i) => {
                                const {x, y} = get2DComponents(Math.PI * (i + .5) / 8, RADIUS);
                                return <line key={i} x1={RADIUS} y1={RADIUS} x2={x} y2={y} />
                            })
                        }
                        <circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="rgba(200, 200, 40, 0.05)" />
                        <circle cx={RADIUS} cy={RADIUS} r={RADIUS * 2/3} />
                        <circle cx={RADIUS} cy={RADIUS} r={RADIUS / 3} />
                    </g>
                }
                <g fill="rgba(0, 207, 11, .2)">
                    <path d={`M ${xL1} ${yL1} L ${xL2} ${yL2} A ${r2} ${r2} 0 0 1 ${xU2} ${yU2} L ${xU1} ${yU1} A ${r1} ${r1} 0 0 0 ${xL1} ${yL1}`} />
                </g>
                {/* <circle cx={xL1} cy={yL1} r={5} fill="red" /> */}
            </svg>
        </div>
        <br/>
        <TreasureIslandPicker selectedIsland={selectedIsland} onUpdate={setSelectedIsland} />
    </div>
}