import { SVGArrowLeft, SVGArrowRight } from "./SVGArrow";


interface LeftRightControlsProps {
    onLeft: () => void;
    onRight: () => void;
    children: React.ReactNode;
}

export default function LeftRightControls({ onLeft, onRight, children }: LeftRightControlsProps) {
    return (
        <div className="flex flex-row justify-center items-center gap-x-2 mx-auto my-1 w-3/5 max-w-[300px] sm:w-1/2 md:w-2/5">
            <SVGArrowLeft onClick={onLeft} />
            <div id="direction" className="flex-auto text-center min-w-[150px]">{children}</div>
            <SVGArrowRight onClick={onRight} />
        </div>
    )
}