import { TriggerHook } from "engine";
import { MODULE } from "module-helpers";

class TestHook extends TriggerHook {
    static get type(): "test-hook" {
        return "test-hook";
    }

    get events(): ["test-event"] {
        return ["test-event"];
    }

    _enable(): void {
        MODULE.devExpose({
            test: () => {
                this.executeEvent("test-event");
            },
        });
    }

    _disable(): void {
        MODULE.devExpose({
            test: () => {},
        });
    }
}

export { TestHook };
