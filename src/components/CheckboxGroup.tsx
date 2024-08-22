import Checkbox, { CheckboxProps } from "./Checkbox";

interface CheckboxGroupProps {
    title: string;
    checkboxes: CheckboxProps[];
}

export default function CheckboxGroup({ title, checkboxes }: CheckboxGroupProps) {
    return <div>
        <div className="big">{title}</div>
        {
            checkboxes.map(checkbox => <Checkbox key={checkbox.className} {...checkbox} />)
        }
    </div>
}