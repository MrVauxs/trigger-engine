import { BuiltinsCustomOutput, BuiltinsInputEntry } from "engine";
import { ItemPF2e, R } from "module-helpers";
import { BaseExtractorNode } from ".";

abstract class ItemExtractorNode extends BaseExtractorNode<ItemPF2e | undefined, "path"> {
    static get type(): "extract-item" {
        return "extract-item";
    }

    static get tags(): string[] {
        return ["item"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [{ key: "input", type: "item" }];
    }

    static get defineCustomOutputs(): BuiltinsCustomOutput[] | null {
        return [{ slug: "path", array: true, input: {} }];
    }

    async _execute(): Promise<boolean> {
        const item = await this.getInputValue("input");

        if (!item) {
            return this.executeNext("out");
        }

        const entries = this.getCustomOutputs("path");

        for (const { key, input } of entries) {
            const value = R.isString(input) ? foundry.utils.getProperty(item, input) : undefined;
            this.setOutputValue(key, value);
        }

        return this.executeNext("out");
    }
}

export { ItemExtractorNode };
