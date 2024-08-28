import DropDown from "./DropDown";

interface Props {
    title: string;
    lines: string[];
    boldLines?: string[];
}

export default function TextDropDown({ title, lines, boldLines }: Props) {
    return (
        <DropDown title={title}>
            {lines.map((line, index) => <p key={index} className="m-0 mb-2"><b>{boldLines && boldLines[index] + ": "}</b>{line}</p>)}
        </DropDown>
    );

}