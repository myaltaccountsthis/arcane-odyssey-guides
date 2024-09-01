import Checkbox, { CheckboxProps } from "./Checkbox";
import Group from "./Group";

interface CheckboxGroupProps {
    title: string;
    checkboxes: CheckboxProps[];
}

export default function CheckboxGroup({ title, checkboxes }: CheckboxGroupProps) {
    return (
        <Group title={title}>
            { checkboxes.map(checkbox => <Checkbox key={checkbox.className} {...checkbox} />) }
        </Group>
    )
}