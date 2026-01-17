import { BuiltinsInputEntry, CustomOutSchema } from "engine";
import { BaseSplitterNode } from ".";

abstract class TextSplitterNode extends BaseSplitterNode<string, string> {
    static get type(): "split-text" {
        return "split-text";
    }

    static get tags(): string[] {
        return ["text"];
    }

    static get defineCustomOuts(): CustomOutSchema[] {
        return [
            {
                slug: "value",
                input: {},
            },
        ];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [{ key: "input", type: "text" }];
    }

    async _execute(): Promise<boolean> {
        const input = await this.getInputValue("input");
        const out = this.getCustomOutKey("value", input);

        return out ? this.executeNext(out) : true;
    }
}

export { TextSplitterNode };
