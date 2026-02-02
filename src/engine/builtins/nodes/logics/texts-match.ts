import { BaseLogicNode, BridgeSchemaInput, BuiltinsInputEntry } from "engine";

class TextsMatchLogicNode extends BaseLogicNode<"true" | "false", Inputs> {
    static get type(): "texts-match" {
        return "texts-match";
    }

    static get tags(): string[] {
        return ["text"];
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            {
                key: "a",
                type: "text",
                field: { trim: false },
            },
            {
                key: "b",
                type: "text",
                field: { trim: false },
            },
        ];
    }

    async _execute(): Promise<boolean> {
        const entryA = await this.getInputValue("a");
        const entryB = await this.getInputValue("b");
        const result = entryA === entryB;

        return this.executeNext(result ? "true" : "false");
    }
}

type Inputs = {
    a: string;
    b: string;
};

export { TextsMatchLogicNode };
