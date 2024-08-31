import Checkbox, { CheckboxProps } from "./Checkbox";

interface CheckboxGroupProps {
    title: string;
    checkboxes: CheckboxProps[];
}

export default function CheckboxGroup({ title, checkboxes }: CheckboxGroupProps) {
    return <div className="grow-0 shrink-1 basis-full w-min lg:basis-[40%]">
        <div className="text-lg w-fit m-auto">{title}</div>
        {
            checkboxes.map(checkbox => <Checkbox key={checkbox.className} {...checkbox} />)
        }
    </div>
}