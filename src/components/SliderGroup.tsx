import Slider, { SliderProps } from "./Slider";

interface SliderGroupProps {
    title: string;
    sliders: SliderProps[];
}

export default function SliderGroup({ title, sliders }: SliderGroupProps) {
    return <div className="grow-0 shrink-1 basis-full w-min lg:basis-[40%]">
        <div className="text-lg w-fit m-auto">{title}</div>
        <div className="">
        {
            sliders.map(slider => <Slider key={slider.className} {...slider} />)
        }
        </div>
    </div>
}