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
                label: "Entry",
                type: "number",
                field: {
                    default: 2,
                },
            } satisfies InputEntrySchema<NumberFieldSchema>,
            {
                key: "test",
                label: "Long Entry Label",
                type: "number",
                field: {
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

    execute(options?: Record<string, any>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    query(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export { TestTriggerNode };
