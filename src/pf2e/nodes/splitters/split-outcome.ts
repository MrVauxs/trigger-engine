import { BaseSplitterNode, BridgeSchemaInput } from "engine";
import { OutcomeEntryType, OutcomEntry, PF2eInputEntry } from "pf2e";

class OutcomeSplitterNode extends BaseSplitterNode<OutcomeEntryType, OutcomeEntryType> {
    static get type(): "split-outcome" {
        return "split-outcome";
    }

    static get tags(): string[] {
        return ["outcome"];
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return OutcomEntry.options.map(({ value, label }): BridgeSchemaInput => {
            return { key: value, label };
        });
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "input", type: "outcome" }];
    }

    async _execute(): Promise<boolean> {
        const input = await this.getInputValue("input");
        return this.executeNext(input);
    }
}

export { OutcomeSplitterNode };
