import Slider, { SliderProps } from "./Slider";

interface SliderGroupProps {
    title: string;
    sliders: SliderProps[];
}

export default function SliderGroup({ title, sliders }: SliderGroupProps) {
    return <div>
        <div className="big">{title}</div>
        {
            sliders.map(slider => <Slider key={slider.className} {...slider} />)
        }
    </div>
}