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
}

export { TestTriggerNode };
