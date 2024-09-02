import { Armor } from "../Backend.ts";

interface Props {
    armor: Armor;
}

export default function ArmorComponent({armor}: Props) {
    return (
        <div>
            <div className={armor.name.split(" ")[0].toLowerCase()}>{armor.modifier && armor.modifier + " "}{armor.enchant && armor.enchant.name + " "}{armor.name}</div>
            <div>{armor.jewels.length > 0 && armor.jewels.join(", ")}</div>
        </div>
    );
}