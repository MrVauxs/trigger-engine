import { BaseLogicNode, BridgeSchemaInput, BuiltinsInputEntry, NodeEntry, NumberEntry } from "engine";
import { localizePath } from "module-helpers";

const COMPARE_ENTRIES = ["eq", "gt", "gte", "lt", "lte"] as const;

abstract class CompareNumbersNode extends BaseLogicNode<"true" | "false", Inputs> {
    static #compareOptions: SelectOptions;

    static get type(): "compare-numbers" {
        return "compare-numbers";
    }

    static get baseEntry(): typeof NodeEntry<any, any> {
        return NumberEntry;
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    static get compareOptions() {
        return (this.#compareOptions ??= ["eq", "gt", "gte", "lt", "lte"].map((value) => {
            return {
                value,
                label: localizePath(`builtins.node.logic`, this.type, "inputs.compare.options", value),
            };
        }));
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
                    tooltip: false,
                    width: 162,
                },
            },
            { key: "b", type: "number" },
        ];
    }

    static compareNumbers(entryA: number, entryB: number, compare: CompareEntry): boolean {
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

    async _execute(): Promise<boolean> {
        const entryA = await this.getInputValue("a");
        const entryB = await this.getInputValue("b");
        const compare = await this.getInputValue("compare");
        const result = CompareNumbersNode.compareNumbers(entryA, entryB, compare);

        return this.executeNext(result ? "true" : "false");
    }
}

type Inputs = {
    a: number;
    b: number;
    compare: CompareEntry;
};

type CompareEntry = (typeof COMPARE_ENTRIES)[number];

export { CompareNumbersNode };
export type { CompareEntry };
