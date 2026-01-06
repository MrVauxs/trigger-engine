import { CustomInputSchema } from "engine";
import { MODULE } from "module-helpers";
import { BaseActionNode } from ".";

class ConsoleActionNode extends BaseActionNode<"out", never, never, "input"> {
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
        const values = await this.getCustomInputsValues("input");

        MODULE.group(this.nodePath);
        for (const value of values) {
            MODULE.log(value);
        }
        MODULE.groupEnd();

        return this.executeNext("out");
    }
}

export { ConsoleActionNode };
