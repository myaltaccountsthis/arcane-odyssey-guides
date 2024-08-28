import Slider, { SliderProps } from "./Slider";

interface SliderGroupProps {
    title: string;
    sliders: SliderProps[];
}

export default function SliderGroup({ title, sliders }: SliderGroupProps) {
    return <div className="slider-group">
        <div className="big w-fit m-auto">{title}</div>
        {
            sliders.map(slider => <Slider key={slider.className} {...slider} />)
        }
    </div>
}