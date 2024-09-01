import { ChangeEvent, useRef, useState } from "react";
import { ArmorCalculatorSettings } from "../types/ArmorCalculatorTypes";
import Button from "./Button";

interface CopyPasteSettingsProps {
    settingsStr: string;
    // setCopyPaste is used when the user pastes into the text box
    setCopyPaste: (value: ArmorCalculatorSettings) => void;
}

export default function CopyPasteSettings(props: CopyPasteSettingsProps) {
    const [isCopying, setIsCopying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [settingsStr, setSettingsStr] = useState(props.settingsStr);
    if (!isEditing && settingsStr != props.settingsStr)
        setSettingsStr(props.settingsStr);

    // on settings changed (pasted or modified)
    function pasteSettings(event: ChangeEvent<HTMLInputElement>) {
        setIsEditing(false);
        const str = event.target.value;
        const settings: {[key: string]: any} = {};
        props.settingsStr.split(";").forEach(setting => settings[setting.split(":")[0]] = JSON.parse(setting.split(":")[1]));
        str.split(";").forEach(setting => {
            try {
                const [key, value] = setting.split(":");
                if (settings[key] === undefined)
                    throw key;
                settings[key] = JSON.parse(value);
            }
            catch (e) {
                console.log(`Invalid setting: ${setting}`);
            }
        });
        props.setCopyPaste(settings);
    }

    const copyTimeout = useRef<number>();
    function copySettings() {
        navigator.clipboard.writeText(settingsStr);
        clearTimeout(copyTimeout.current);
        setIsCopying(true);
        copyTimeout.current = setTimeout(() => { setIsEditing(false); setIsCopying(false); }, 300);
    }

    return <div>
        <div>Copy Paste Settings</div>
        <input className="border-2 border-black border-solid rounded-md !w-[40%] min-w-[300px] max-w-[1200px] p-[6px] hover:bg-gray-50 focus:bg-transparent transition-colors" style={{fontFamily: "Consolas, 'Courier New'"}} id="copy-paste" type="text" value={settingsStr} onChange={(e) => setSettingsStr(e.target.value)} onFocus={() => setIsEditing(true)} onBlur={pasteSettings} />
        <span> </span>
        <Button className={`${isCopying ? "!bg-green-300" : ""}`} onClick={copySettings}>{isCopying ? "Copied!" : "Copy"}</Button>
    </div>
}