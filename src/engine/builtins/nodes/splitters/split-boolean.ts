import { BridgeSchemaInput, BuiltinsInputEntry } from "engine";
import { BaseSplitterNode } from ".";

abstract class BooleanSplitterNode extends BaseSplitterNode<"true" | "false", { input: boolean }> {
    static get type(): "split-boolean" {
        return "split-boolean";
    }

    static get tags(): string[] {
        return ["boolean"];
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [{ key: "input", type: "boolean" }];
    }

    async _execute(): Promise<boolean> {
        const input = await this.getInputValue("input");
        return this.executeNext(input ? "true" : "false");
    }
}

export { BooleanSplitterNode };
