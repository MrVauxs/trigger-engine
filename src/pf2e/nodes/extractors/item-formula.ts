import { BaseExtractorNode, BuiltinsOutputEntry } from "engine";
import { ItemPF2e } from "module-helpers";
import { PF2eInputEntry } from "pf2e/entries";
import { extractItemInline, extractItemInputs, ItemExtractInputs } from "..";

class ItemFormulaExtractorNode extends BaseExtractorNode<Inputs, Outputs> {
    static get type(): "item-formula" {
        return "item-formula";
    }

    static get tags(): string[] {
        return ["item", "damage"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "item", type: "item" }, ...extractItemInputs()];
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [
            { key: "formula", type: "text" },
            { key: "options", type: "text" },
            { key: "traits", type: "text" },
        ];
    }

    async _execute(): Promise<boolean> {
        const item = await this.getInputValue("item");

        if (!item) {
            return this.executeNext("out");
        }

        const index = await this.getInputValue("index");
        const rawParams = extractItemInline(item, index, "formula");

        if (rawParams?.formula) {
            this.setOutputValue("formula", rawParams.formula);
            this.setOutputValue("options", rawParams.options);
            this.setOutputValue("traits", rawParams.traits);
        }

        return this.executeNext("out");
    }
}

type Inputs = ItemExtractInputs & {
    item?: ItemPF2e;
};

type Outputs = {
    formula: string;
    options?: string;
    traits?: string;
};

export { ItemFormulaExtractorNode };
