import { IconObject } from "_zod";
import { TriggerNode } from "engine";
import { START_EVENT_TYPE } from "engine/application";

class _StartEventNode extends TriggerNode<"out"> {
    static get type(): string {
        return START_EVENT_TYPE;
    }

    static get isEvent(): boolean {
        return true;
    }

    get icon(): IconObject {
        return {
            unicode: "\uf11e",
            fontWeight: "800",
        };
    }

    _execute(): Promise<boolean> {
        return this.executeNext("out");
    }
}

export { _StartEventNode };
