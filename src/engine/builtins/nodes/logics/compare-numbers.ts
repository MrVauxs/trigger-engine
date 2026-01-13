import { BridgeSchemaInput, BuiltinsInputEntry, TriggerNode } from "engine";

abstract class CompareNumbersNode extends TriggerNode<"true" | "false", Inputs> {
    static compareOptions = ["eq", "gt", "gte", "lt", "lte"] as const;

    static get category(): "logic" {
        return "logic";
    }

    static get type(): "compare-numbers" {
        return "compare-numbers";
    }

    static get tags(): string[] {
        return ["number"];
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "a", type: "number" },
            {
                key: "compare",
                type: "text",
                field: {
                    type: "select",
                    options: CompareNumbersNode.compareOptions,
                    connector: false,
                    width: 160,
                },
            },
            { key: "b", type: "number" },
        ];
    }

    get headerColor(): number {
        return 0x07b88f;
    }

    get subtitle(): null {
        return null;
    }

    async _execute(): Promise<boolean> {
        const entryA = await this.getInputValue("a");
        const entryB = await this.getInputValue("b");
        const compare = await this.getInputValue("compare");
        const result = compareNumbers(entryA, entryB, compare);

        return this.executeNext(result ? "true" : "false");
    }
}

function compareNumbers(entryA: number, entryB: number, compare: CompareEntry): boolean {
    switch (compare) {
        case "eq":
            return entryA === entryB;
        case "gt":
            return entryA > entryB;
        case "gte":
            return entryA >= entryB;
        case "lt":
            return entryA < entryB;
        case "lte":
            return entryA <= entryB;
        default:
            return false;
    }
}

type Inputs = {
    a: number;
    b: number;
    compare: CompareEntry;
};

type CompareEntry = (typeof CompareNumbersNode.compareOptions)[number];

export { CompareNumbersNode };
