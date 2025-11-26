import { MODULE } from "module-helpers";

class TriggerHook {
    get events(): string[] {
        throw MODULE.Error("the 'events' static getter must be implemented.");
    }
}

export { TriggerHook };
