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

    get icon(): string {
        return "\ue4f3";
    }

    _execute(options?: Record<string, any>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    _query(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export { TestTriggerNode };
