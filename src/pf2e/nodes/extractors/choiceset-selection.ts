import { IconObject } from "_zod";
import { BaseExtractorNode } from "engine";
import { getChoiceSetSelection, ItemPF2e } from "module-helpers";
import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";

class ChoicesetSelectionLogicNode extends BaseExtractorNode<Inputs, { selection: string }> {
    static get type(): "choiceset-selection" {
        return "choiceset-selection";
    }

    static get tags(): string[] {
        return ["rule"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "item", type: "item" },
            { key: "flag", type: "text" },
            { key: "option", type: "text" },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "selection", type: "text" }];
    }

    get icon(): IconObject {
        return { unicode: "\uf03a" };
    }

    async _execute(): Promise<boolean> {
        const item = await this.getInputValue("item");

        if (item) {
            const flag = await this.getInputValue("flag");
            const option = await this.getInputValue("option");
            const selection = getChoiceSetSelection(item, { flag, option });

            if (selection) {
                this.setOutputValue("selection", selection);
            }
        }

        return this.executeNext("out");
    }
}

type Inputs = {
    flag: string;
    item?: ItemPF2e;
    option: string;
};

export { ChoicesetSelectionLogicNode };
