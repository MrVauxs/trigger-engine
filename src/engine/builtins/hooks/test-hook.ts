import { TestEvent, TriggerHook } from "engine";

class TestHook extends TriggerHook {
    static get type(): "test-hook" {
        return "test-hook";
    }

    get events(): ["test-event"] {
        return ["test-event"];
    }

    get gmOnly(): boolean {
        return false;
    }

    _enable(): void {
        foundry.utils.setProperty(globalThis, TestEvent.functionPath, () => {
            this.executeEvent("test-event");
        });
    }

    _disable(): void {
        foundry.utils.setProperty(globalThis, TestEvent.functionPath, () => {});
    }
}

export { TestHook };
