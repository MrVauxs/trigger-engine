import { TriggerNode } from "engine";

class TestTriggerNode extends TriggerNode {
    static get type(): string {
        return "test-event";
    }

    static get isEvent(): boolean {
        return true;
    }

    static get tags(): string[] {
        return ["test"];
    }
}
