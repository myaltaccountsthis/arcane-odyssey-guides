import { solve } from "./Backend";

self.onmessage = (event) => {
    self.postMessage(solve());
};