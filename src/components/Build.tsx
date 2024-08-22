interface Props {
    armorList: Armor[];
    stats: number[];
    vit: number;
    jewelSlots: number;
    hash: number;
    multiplier: number;
}

function Build({ armorList, stats, vit, jewelSlots, hash, multiplier }: Props) {
    return (
        <div>
        <h1>Build</h1>
        </div>
    );
}

export default Build;