import { BuiltinsCustomEntry } from "engine";
import { MODULE } from "module-helpers";
import { BaseActionNode } from ".";
import { IconObject } from "_zod";

class ConsoleLogActionNode extends BaseActionNode<"out", never, never, "input"> {
    static get type(): "console-log" {
        return "console-log";
    }

    static get tags(): string[] {
        return ["debug"];
    }

    static get defineCustomInputs(): BuiltinsCustomEntry[] {
        return [{ slug: "input", array: true }];
    }

    get icon(): IconObject {
        return { unicode: "\uf120" };
    }

    async _execute(): Promise<boolean> {
        const values = await this.getCustomInputs("input");

        MODULE.group(this.nodePath);
        for (const { label, value } of values) {
            MODULE.log(`${label}:`, value);
        }
        MODULE.groupEnd();

        return this.executeNext("out");
    }
}

export { ConsoleLogActionNode };
