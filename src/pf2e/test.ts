import { TriggerNode } from "engine";

class TestNode extends TriggerNode {
    static get category(): string {
        return "category";
    }

    static get type(): string {
        return "type";
    }

    static get isEvent(): boolean {
        return false;
    }
}

export { TestNode };
