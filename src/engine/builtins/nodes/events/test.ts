import { TriggerNode } from "engine";

class TestEventNode extends TriggerNode<"out"> {
    static get type(): "test-event" {
        return "test-event";
    }

    static get isEvent(): boolean {
        return true;
    }

    static get tags(): string[] {
        return ["debug"];
    }

    get icon(): string {
        return "\ue4f3";
    }

    _execute(): Promise<boolean> {
        return this.executeNext("out");
    }
}

export { TestEventNode };
