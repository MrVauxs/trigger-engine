import { BuiltinsInputEntry } from "engine";
import { ItemPF2e } from "module-helpers";
import { BaseExtractorNode } from ".";

class ItemExtractorNode extends BaseExtractorNode<ItemPF2e, ItemPF2e> {
    static get type(): "extract-item" {
        return "extract-item";
    }

    static get tags(): string[] {
        return ["item"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [{ key: "input", type: "item" }];
    }

    _castDocument(item: ItemPF2e): ItemPF2e {
        return item;
    }
}

export { ItemExtractorNode };
