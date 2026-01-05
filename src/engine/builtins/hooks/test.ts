import { MODULE } from "module-helpers";
import { BuiltInTriggerHooks } from ".";
import { TestEventExecuteOptions } from "..";

class TestTriggerHook extends BuiltInTriggerHooks<TestEventExecuteOptions> {
    static get type(): "test-hook" {
        return "test-hook";
    }

    get events(): ["test-event"] {
        return ["test-event"];
    }

    _enable(): void {
        MODULE.devExpose({
            test: (args: TestEventExecuteOptions) => {
                this.executeEvent("test-event", args);
            },
        });
    }

    _disable(): void {
        MODULE.devExpose({
            test: (args: TestEventExecuteOptions) => {},
        });
    }
}

export { TestTriggerHook };
