import { IconObject } from "_zod";
import { BuiltInTriggerNode } from "..";
import { START_EVENT_TYPE } from "engine/application";

class _StartTriggerNode extends BuiltInTriggerNode {
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

    _execute(options?: Record<string, any>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    _query(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export { _StartTriggerNode };
