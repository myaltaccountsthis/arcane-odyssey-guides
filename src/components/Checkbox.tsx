import { ChangeEvent } from "react";

export interface CheckboxProps {
    className: string;
    name: string;
    isChecked?: boolean;
    onChange?: (value: boolean) => void;
}

export default function Checkbox({ className, name, isChecked, onChange }: CheckboxProps) {
    const onInput = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.checked);
    };

    return <div>
        <label htmlFor={className}>{name}</label>
        <span> </span>
        <input id={className} name={className} type="checkbox" checked={isChecked} onChange={onInput} />
        <span />
    </div>
}