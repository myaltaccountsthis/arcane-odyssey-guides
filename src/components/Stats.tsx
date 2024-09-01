import Stat from "./Stat";

interface Props {
    stats: number[];
}

export default function Stats({ stats }: Props) {
    return (
        <div>
            {stats.map((stat, index) => <Stat key={index} index={index} value={stat} />)}
        </div>
    );
}