import { InputEntrySchema, NumberFieldSchema, OutputEntrySchema } from "engine";
import { BuiltInTriggerNode } from "..";

class TestTriggerNode extends BuiltInTriggerNode {
    static get type(): "test-event" {
        return "test-event";
    }

    static get isEvent(): boolean {
        return true;
    }

    static get tags(): string[] {
        return ["debug"];
    }

    // TODO REMOVE THAT
    static get defineInputs(): InputEntrySchema[] {
        return [
            {
                key: "entry",
                type: "number",
                fields: {
                    default: 2,
                },
            } satisfies InputEntrySchema<NumberFieldSchema>,
        ];
    }
    // TODO REMOVE THAT
    static get defineOutputs(): OutputEntrySchema[] {
        return [
            {
                key: "result",
                label: "Result",
                type: "number",
            },
        ];
    }

    get icon(): string {
        return "\ue4f3";
    }
}

export { TestTriggerNode };
