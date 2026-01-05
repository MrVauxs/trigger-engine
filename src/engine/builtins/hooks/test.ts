import { MODULE } from "module-helpers";
import { BuiltInTriggerHooks } from ".";

class TestTriggerHook extends BuiltInTriggerHooks {
    static get type(): "test-hook" {
        return "test-hook";
    }

    get events(): ["test-event"] {
        return ["test-event"];
    }

    _enable(): void {
        MODULE.devExpose({
            test: (...args: any[]) => {
                this.executeEvent("test-event", ...args);
            },
        });
    }

    _disable(): void {
        MODULE.devExpose({
            test: (...args: any[]) => {},
        });
    }
}

export { TestTriggerHook };
