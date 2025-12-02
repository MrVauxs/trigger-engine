import { NodeHeaderSource } from "engine/node";
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

    get header(): NodeHeaderSource {
        return {
            ...super.header,
            icon: "\ue4f3",
        };
    }
}

export { TestTriggerNode };
