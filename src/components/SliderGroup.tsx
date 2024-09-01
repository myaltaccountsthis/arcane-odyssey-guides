import Group from "./Group";
import Slider, { SliderProps } from "./Slider";

interface SliderGroupProps {
    title: string;
    sliders: SliderProps[];
}

export default function SliderGroup({ title, sliders }: SliderGroupProps) {
    return (
        <Group title={title}>
            { sliders.map(slider => <Slider key={slider.className} {...slider} />) }
        </Group>
    )
}