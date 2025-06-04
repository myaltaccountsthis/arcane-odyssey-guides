import { ChangeEvent, useState } from "react";

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
    const [isEditing, setIsEditing] = useState(false);
    const [val, setVal] = useState(value);
    if (!isEditing && val != value)
        setVal(value);

    const changeVal = (val: number, checkBounds = true) => {
        if (checkBounds)
            val = Math.min(Math.max(min, val), max);
        if (isNaN(val))
            val = 0;
        setVal(val);
        return val;
    };
    const onCapture = () => {
        setIsEditing(true);
    }
    const onRelease = () => {
        onChange(changeVal(val));
        setIsEditing(false);
    }
    const onInput = (event: ChangeEvent<HTMLInputElement>, checkBounds = true) => {
        changeVal(parseInt(event.target.value), checkBounds);
    };

    return (
        <div className="flex justify-center gap-x-2 mx-auto my-[2px]">
            <label htmlFor={className} className="grow-0 shrink basis-[150px] text-right">{name}</label>
            <input id={className} onInput={onInput} onTouchStart={onCapture} onTouchEnd={onRelease} onMouseDown={onCapture} onMouseUp={onRelease} name={className} type="range" min={min} max={max} step={step} value={val} />
            <span className="grow-0 shrink basis-[150px] text-left"><input className="border-2 border-black border-solid rounded-md w-11 hover:bg-gray-100 focus:bg-inherit transition-colors" id={`${className}-text`} onInput={e => onInput(e as React.ChangeEvent<HTMLInputElement>, false)} onFocus={onCapture} onBlur={onRelease} type="text" value={val} /></span>
        </div>
    );
}