import { NodeEntry } from "engine";
import { BlueprintEntry } from ".";
import { BlueprintNode } from "..";

class BlurprintInputEntry extends BlueprintEntry {
    constructor(parent: BlueprintNode, entry: NodeEntry) {
        super(parent, "inputs", entry);
    }
}

export { BlurprintInputEntry };
