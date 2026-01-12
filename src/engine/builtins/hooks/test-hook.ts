import { TestEventNode, TriggerHook } from "engine";

class TestHook extends TriggerHook {
    static get type(): "test-hook" {
        return "test-hook";
    }

    get events(): ["test-event"] {
        return ["test-event"];
    }

    _enable(): void {
        foundry.utils.setProperty(globalThis, TestEventNode.functionPath, () => {
            this.executeEvent("test-event");
        });
    }

    _disable(): void {
        foundry.utils.setProperty(globalThis, TestEventNode.functionPath, () => {});
    }
}

export { TestHook };
