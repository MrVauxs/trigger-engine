import { IconObject } from "_zod";
import { BaseEventNode, BuiltinsCustomEntry, ExecuteEventOptions } from "engine";

class ExecuteEvent extends BaseEventNode {
    static get type(): "execute-event" {
        return "execute-event";
    }

    static get tags(): string[] {
        return ["macro"];
    }

    static get defineCustomOutputs(): BuiltinsCustomEntry[] {
        return [{ array: true, slug: "output" }];
    }

    get icon(): IconObject {
        return { unicode: "\uf144" };
    }

    async _execute({ converted, values }: ExecuteEventOptions): Promise<boolean> {
        const parsed = converted
            ? await this.convertValuesFomEmitable(values)
            : this.parseUserValues(values).map((x) => x?.value);

        this.setCustomOutputValues("output", parsed);
        return this.executeNext("out");
    }
}

export { ExecuteEvent };
