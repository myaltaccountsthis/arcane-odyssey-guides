import { solve, updateInputs, updateInfo } from "./Backend";
import { EventData } from "./types/ArmorCalculatorTypes";


self.onmessage = (event) => {
    const data = event.data as EventData;
    if (data.type === "init") {
        // Load the data
        self.postMessage({
            type: "init",
            body: updateInfo(data.body)
        });
    }
    else if (data.type == "config") {
        // Update inputs
        updateInputs(data.body);
    }
    else if (data.type == "solve") {
        // Perform solve
        self.postMessage({type: "solve", body: solve()});
    }
};