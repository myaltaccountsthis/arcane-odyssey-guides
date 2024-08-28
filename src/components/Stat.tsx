enum StatName {
    "power",
    "defense",
    "size",
    "intensity",
    "speed",
    "agility",
    "regeneration",
    "resistance",
    "armorpiercing",
    "insanity",
    "warding",
    "drawback"
}

interface Props {
    index: number;
    value: number;
}

export default function Stat({ index, value } : Props) {
    if (value == 0) return null;
    return <span className="">
        <span className={StatName[index]}>{value}</span><img className="icon" src={"./armor/" + StatName[index] + "_icon.png"} />
    </span>
}