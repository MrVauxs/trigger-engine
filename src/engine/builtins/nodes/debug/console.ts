import { CustomInputSchema } from "engine";
import { MODULE } from "module-helpers";
import { BaseDebugNode } from ".";

class ConsoleActionNode extends BaseDebugNode<"out", never, never, "input"> {
    static get type(): "console-log" {
        return "console-log";
    }

    static get tags(): string[] {
        return ["debug"];
    }

    static get defineCustomInputs(): CustomInputSchema[] {
        return [{ slug: "input", array: true }];
    }

    get icon(): string {
        return "\uf120";
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

export { ConsoleActionNode };
