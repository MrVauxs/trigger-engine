import { TriggerNode } from "engine";

class TestNode extends TriggerNode {
    static get category(): string {
        return "category";
    }

    static get type(): string {
        return "type";
    }

    static get systems(): string[] {
        return ["pf2e", "dnd5e"];
    }

    static get isEvent(): boolean {
        return false;
    }
}

export { TestNode };
