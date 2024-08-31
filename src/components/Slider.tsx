import { ChangeEvent } from "react";

export interface SliderProps {
    className: string;
    name: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}

// name is the display name, className is lowercase
export default function Slider({ className, name, value, min, max, step, onChange }: SliderProps) {
    const onInput = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(parseInt(event.target.value));
    };

    return (
        <div className="flex justify-center gap-x-2 mx-auto my-[2px]">
            <label className="grow-0 shrink basis-[150px] text-right">{name}</label>
            <input id={className} onInput={onInput} name={className} type="range" min={min} max={max} step={step} value={value} />
            <span className="grow-0 shrink basis-[150px] text-left"><input className="border-2 border-black border-solid rounded-md w-12" id={`${className}-text`} onInput={onInput} type="text" value={value} /></span>
        </div>
    );
}