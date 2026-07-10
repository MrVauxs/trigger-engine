import { BaseSplitterNode, BridgeSchemaInput } from "engine";
import { ZeroToFour } from "foundry-helpers";
import { PF2eInputEntry, RankEntry, RankEntryType } from "pf2e/entries";

class RankSplitterNode extends BaseSplitterNode<RankEntryType, ZeroToFour> {
    static get type(): "split-rank" {
        return "split-rank";
    }

    static get tags(): string[] {
        return ["rank"];
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return RankEntry.options.map(({ value, label }): BridgeSchemaInput => {
            return { key: String(value), label };
        });
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "input", type: "rank" }];
    }

    async _execute(): Promise<boolean> {
        const input = String(await this.getInputValue("input")) as RankEntryType;
        return this.executeNext(input);
    }
}

export { RankSplitterNode };
