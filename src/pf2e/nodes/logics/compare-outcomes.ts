import { BaseLogicNode, BridgeSchemaInput, CompareEntry, CompareNumbersLogicNode } from "engine";
import { DegreeOfSuccessString, degreeOfSuccessNumber } from "module-helpers";
import { PF2eInputEntry } from "pf2e";

abstract class CompareOutcomesLogicNode extends BaseLogicNode<"true" | "false", Inputs> {
    static get type(): "compare-outcomes" {
        return "compare-outcomes";
    }

    static get tags(): string[] {
        return ["outcome"];
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "a", type: "outcome" }, CompareNumbersLogicNode.defineInputs[1], { key: "b", type: "outcome" }];
    }

    async _execute(): Promise<boolean> {
        const entryA = await this.getInputValue("a");
        const entryB = await this.getInputValue("b");
        const compare = await this.getInputValue("compare");

        const numberA = degreeOfSuccessNumber(entryA)!;
        const numberB = degreeOfSuccessNumber(entryB)!;

        const result = CompareNumbersLogicNode.compareNumbers(numberA, numberB, compare);

        return this.executeNext(result ? "true" : "false");
    }
}

type Inputs = {
    a: DegreeOfSuccessString;
    b: DegreeOfSuccessString;
    compare: CompareEntry;
};

export { CompareOutcomesLogicNode };
