import { BaseBooleanLogicNode, CompareEntry, CompareNumbersLogicNode } from "engine";
import { ZeroToFour } from "foundry-helpers";
import { PF2eInputEntry } from "pf2e";

class CompareRanksLogicNode extends BaseBooleanLogicNode<Inputs> {
    static get type(): "compare-ranks" {
        return "compare-ranks";
    }

    static get tags(): string[] {
        return ["rank"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "a", type: "rank" }, CompareNumbersLogicNode.defineInputs[1], { key: "b", type: "rank" }];
    }

    async _execute(): Promise<boolean> {
        const entryA = await this.getInputValue("a");
        const entryB = await this.getInputValue("b");
        const compare = await this.getInputValue("compare");

        const result = CompareNumbersLogicNode.compareNumbers(entryA, entryB, compare);

        return this.executeNextIf(result);
    }
}

type Inputs = {
    a: ZeroToFour;
    b: ZeroToFour;
    compare: CompareEntry;
};

export { CompareRanksLogicNode };
