import { ChangeEvent, useRef, useState } from "react";

interface CopyPasteSettingsProps {
    settingsStr: string;
    // setCopyPaste is used when the user pastes into the text box
    setCopyPaste: (value: string) => void;
}

export default function CopyPasteSettings({ settingsStr, setCopyPaste }: CopyPasteSettingsProps) {
    const [isCopying, setIsCopying] = useState(false);
      
    // on settings changed (pasted or modified)
    function pasteSettings(event: ChangeEvent<HTMLInputElement>) {
        const str = event.target.value;
        const settings = JSON.parse(settingsStr);
        str.split(";").forEach(setting => {
            try {
                const [key, value] = setting.split(":");
                settings[key] = JSON.parse(value);
            }
            catch (e) {
                console.log(`Invalid setting: ${setting}`);
            }
        });
        setCopyPaste(JSON.stringify(settings));
    }

    const copyTimeout = useRef<number>();
    function copySettings() {
        navigator.clipboard.writeText(settingsStr);
        clearTimeout(copyTimeout.current);
        copyTimeout.current = setTimeout(() => setIsCopying(false), 200);
    }

    return <div>
        <div>Copy Paste Settings</div>
        <input className="input-text w-[40%] min-w-[300px] max-w-[800px]" style={{fontFamily: "Consolas, 'Courier New'"}} id="copy-paste" type="text" value={settingsStr} onBlur={pasteSettings} />
        <input style={{backgroundColor: isCopying ? "lightgreen" : ""}} type="button" onClick={copySettings} value="Copy" />
    </div>
}