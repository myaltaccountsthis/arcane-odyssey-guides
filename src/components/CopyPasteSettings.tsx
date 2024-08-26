import { ChangeEvent, useRef, useState } from "react";
import { ArmorCalculatorSettings } from "../types/ArmorCalculatorTypes";

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
        const str = event.target.value;
        const settings: {[key: string]: any} = {};
        props.settingsStr.split(";").forEach(setting => settings[setting.split(":")[0]] = JSON.parse(setting.split(":")[1]));
        str.split(";").forEach(setting => {
            try {
                const [key, value] = setting.split(":");
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
        copyTimeout.current = setTimeout(() => { setIsEditing(false); setIsCopying(false); }, 200);
    }

    return <div>
        <div>Copy Paste Settings</div>
        <input className="input-text !w-[40%] min-w-[300px] max-w-[1200px]" style={{fontFamily: "Consolas, 'Courier New'"}} id="copy-paste" type="text" value={settingsStr} onChange={(e) => setSettingsStr(e.target.value)} onFocus={() => setIsEditing(true)} onBlur={pasteSettings} />
        <input style={{backgroundColor: isCopying ? "lightgreen" : ""}} type="button" onClick={copySettings} value="Copy" />
    </div>
}