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
        onChange(event.target.valueAsNumber);
    };

    return (
        <div className="slider">
            <label>{name}</label>
            <input id={className} onInput={onInput} name={className} type="range" min={min} max={max} step={step} value={value} />
            <span><input className="input-text" id={`${className}-text`} onInput={onInput} type="text" value={value} /></span>
        </div>
    );
}