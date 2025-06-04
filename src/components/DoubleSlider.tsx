import { ChangeEvent, useState } from "react";

export interface DoubleSliderProps {
    className: string;
    name: string;
    leftValue: number;
    rightValue: number;
    min: number;
    max: number;
    step: number;
    onChange: (left: number, right: number) => void;
}

// name is the display name, className is lowercase
export default function DoubleSlider({ className, name, leftValue, rightValue, min, max, step, onChange }: DoubleSliderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [leftVal, setLeftVal] = useState(min);
    const [rightVal, setRightVal] = useState(max);
    if (!isEditing && leftVal != leftValue)
        setLeftVal(leftValue);
    if (!isEditing && rightVal != rightValue)
        setRightVal(rightValue);

    const changeVal = (val: number, isLeft: boolean, checkBounds = true) => {
        if (checkBounds) {
            val = Math.min(Math.max(min, val), max);
            if (isLeft) {
                val = Math.min(val, rightVal);
            } else {
                val = Math.max(val, leftVal);
            }
        }
        if (isNaN(val))
            val = 0;
        if (isLeft) {
            setLeftVal(val);
        } else {
            setRightVal(val);
        }
        return val;
    };
    const onLeftCapture = () => {
        setIsEditing(true);
    }
    const onLeftRelease = () => {
        onChange(changeVal(leftVal, true), rightVal);
        setIsEditing(false);
    }
    const onRightCapture = () => {
        setIsEditing(true);
    }
    const onRightRelease = () => {
        onChange(leftVal, changeVal(rightVal, false));
        setIsEditing(false);
    }
    const onLeftInput = (event: ChangeEvent<HTMLInputElement>, checkBounds = true) => {
        changeVal(parseInt(event.target.value), true, checkBounds);
    };
    const onRightInput = (event: ChangeEvent<HTMLInputElement>, checkBounds = true) => {
        changeVal(parseInt(event.target.value), false, checkBounds);
    }

    return (
        <div className="flex justify-center items-center gap-x-2 mx-auto my-[2px] p-4">
            <span className="grow-0 shrink basis-[150px] text-right">{name}</span>
            <div className="min-w-40 relative">
                <div className="absolute h-1 top-1/2 w-full -translate-y-1/2">
                    <div className="absolute w-full h-full bg-gray-300 rounded-full"/>
                    <div
                        className="absolute bg-blue-500 h-full rounded-full" // This is the "bolded" middle part
                        style={{
                            left: `${((leftVal - min) / (max - min)) * 100}%`,
                            width: `${((rightVal - leftVal) / (max - min)) * 100}%`,
                            zIndex: 1,
                        }}
                    />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={leftVal} // State variable for min thumb
                    onInput={onLeftInput}
                    onMouseDown={onLeftCapture}
                    onTouchStart={onLeftRelease}
                    onMouseUp={onLeftCapture}
                    onTouchEnd={onLeftRelease}
                    className="range-slider-thumb -translate-y-1/2"
                    aria-label={`${name} minimum value`}
                    style={{ zIndex: 1 }} // Ensure thumb is on top and input is interactive
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={rightVal} // State variable for max thumb
                    onInput={onRightInput}
                    onMouseDown={onRightCapture}
                    onTouchStart={onRightRelease}
                    onMouseUp={onRightCapture}
                    onTouchEnd={onRightRelease}
                    className="range-slider-thumb -translate-y-1/2"
                    aria-label={`${name} maximum value`}
                    style={{ zIndex: 1 }} // Max thumb on top of min thumb if they overlap
                />
            </div>
            <div className="w-24 text-sm text-center tabular-nums">
            {leftVal} - {rightVal}
            </div>
        </div>
    );
}