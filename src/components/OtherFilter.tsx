import DoubleSlider from "./DoubleSlider";
import DropDown from "./DropDown";

interface OtherFilterProps {
    enchantList: string[];
    jewelList: string[];
    modifierList: string[];
    updateState: (type: string, left: number, right: number) => void;
}

export default function OtherFilterProps({ enchantList, jewelList, modifierList, updateState }: OtherFilterProps) {
    const updateEnchant = (enchant: string) => {
        return (left: number, right: number) => {
            updateState(enchant, left, right);
        }
    }
    return (
        <DropDown title="Other Filters" buttonClassName="!w-[180px]">
            <div className="flex flex-row flex-wrap justify-center w-fit max-w-[420px] lg:max-w-[840px] m-auto gap-y-4">
                <div className="min-w-[400px]">
                    <div className="font-bold">Other Filters</div>
                    <br />
                    <div className="flex flex-row flex-wrap justify-center items-center w-full gap-2">
                        {enchantList.map((enchant, i) => (
                            <DoubleSlider className={enchant.toLowerCase().replace(" ", "-")} key={i} name={enchant} leftValue={0} rightValue={5} min={0} max={5} step={1} onChange={updateEnchant(enchant)} ></DoubleSlider>
                        ))}
                    </div>
                </div>
            </div>
        </DropDown>
    );
}