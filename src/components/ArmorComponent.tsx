import { Armor } from "../Backend.ts";

interface Props {
    armor: Armor;
}

export default function ArmorComponent({armor}: Props) {
    const armorName = armor.toString().replaceAll("_", " ");
    return (
        <>
            <div className={armorName.split(" ")[0].toLowerCase()}>{armor.modifier && armor.modifier + " "}{armor.enchant && armor.enchant.name + " "}{armorName}</div>
            <div>{armor.jewels.length > 0 && armor.jewels.join(" ")}</div>
            <div className="br-small" />
        </>
    );
}