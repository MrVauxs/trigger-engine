import { BuiltinsInputEntry, CustomOutSchema } from "engine";
import { BaseSplitterNode } from ".";

abstract class NumberSplitterNode extends BaseSplitterNode<string, { input: number }> {
    static get type(): "split-number" {
        return "split-number";
    }

    static get tags(): string[] {
        return ["number"];
    }

    static get defineOuts(): null {
        return null;
    }

    static get defineCustomOuts(): CustomOutSchema[] {
        return [
            {
                slug: "out",
                input: {
                    isNumber: true,
                    replaceLabel: true,
                },
            },
        ];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [{ key: "input", type: "number" }];
    }

    async _execute(): Promise<boolean> {
        const input = await this.getInputValue("input");
        const out = this.getCustomOutKey("out", input);

        return out ? this.executeNext(out) : true;
    }
}

export { NumberSplitterNode };
