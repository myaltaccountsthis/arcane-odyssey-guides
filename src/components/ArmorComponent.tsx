import { Armor } from "../Backend.ts";

interface Props {
    armor: Armor;
}

export default function ArmorComponent({armor}: Props) {
    const armorName = armor.toString().replaceAll("_", " ");
    return (
        <>
            <tr><td className={armorName.split(" ")[0].toLowerCase()}>{armor.modifier && armor.modifier + " "}{armor.enchant && armor.enchant.name + " "}{armorName}</td></tr>
            <tr><td>${armor.jewels.join(" ")}</td></tr>;
        </>
    );
}