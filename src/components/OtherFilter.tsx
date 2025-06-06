import DoubleSlider from "./DoubleSlider";
import DropDown from "./DropDown";
import { OtherType } from "../types/ArmorCalculatorTypes";

interface OtherFilterProps {
    enchantList: string[];
    jewelList: string[];
    modifierList: string[];
    updateState: (type: OtherType, name: string, left: number, right: number) => void;
}

export default function OtherFilterProps({ enchantList, jewelList, modifierList, updateState }: OtherFilterProps) {
    const updateEnchant = (enchant: string) => {
        return (left: number, right: number) => {
            updateState("enchant", enchant, left, right);
        }
    }
    const updateJewel = (jewel: string) => {
        return (left: number, right: number) => {
            updateState("jewel", jewel, left, right);
        }
    }
    const updateModifier = (modifier: string) => {
        return (left: number, right: number) => {
            updateState("modifier", modifier, left, right);
        }
    }
    return (
        <DropDown title="Other Filters" buttonClassName="!w-[180px]">
            <div className="w-fit max-w-[420px] lg:max-w-[840px] m-auto gap-y-4">
                <div className="min-w-[400px]">
                    <div className="font-bold text-lg">Other Filters</div>
                    <br />
                    <div className="flex flex-col lg:flex-row lg:flex-wrap justify-evenly items-center w-full">
                        <div className="w-full font-semibold">Enchants</div>
                        {enchantList.map((enchant, i) => (
                            <DoubleSlider key={i} name={enchant} leftValue={0} rightValue={5} min={0} max={5} step={1} onChange={updateEnchant(enchant)} ></DoubleSlider>
                        ))}
                        <div className="w-full font-semibold mt-4">Jewels</div>
                        {jewelList.map((jewel, i) => (
                            <DoubleSlider key={i} name={jewel} leftValue={0} rightValue={10} min={0} max={10} step={1} onChange={updateJewel(jewel)} ></DoubleSlider>
                        ))}
                        <div className="w-full font-semibold mt-4">Modifiers</div>
                        {modifierList.map((modifier, i) => (
                            <DoubleSlider key={i} name={modifier} leftValue={0} rightValue={5} min={0} max={5} step={1} onChange={updateModifier(modifier)} ></DoubleSlider>
                        ))}
                    </div>
                </div>
            </div>
        </DropDown>
    );
}