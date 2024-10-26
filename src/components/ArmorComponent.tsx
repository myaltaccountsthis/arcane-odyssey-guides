import { Armor, armorToString } from "../Backend.ts";
import {} from "../Backend.ts";

interface Props {
    armor: Armor;
}

export default function ArmorComponent({armor}: Props) {
    return (
        <div>
            <div className={armor.name.split(" ")[0].toLowerCase()}>{armor.modifier && armorToString(armor.modifier) + " "}{armor.enchant && armor.enchant.name + " "}{armor.name}</div>
            <div>{armor.jewels.length > 0 && armor.jewels.map(jewel => armorToString(jewel)).join(", ")}</div>
        </div>
    );
}