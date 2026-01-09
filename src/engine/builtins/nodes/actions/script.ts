import { BuiltinsInputEntry, CustomInputSchema, CustomOutputSchema } from "engine";
import { R, isScriptMacro } from "module-helpers";
import { BaseActionNode } from ".";

class ScriptActionNode extends BaseActionNode<
    "out",
    { script: string; macro: string },
    never,
    "input",
    "output",
    "macro" | "script"
> {
    static get type(): "execute-script" {
        return "execute-script";
    }

    static get tags(): string[] {
        return ["macro"];
    }

    static get states(): string[] {
        return ["script", "macro"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            {
                key: "script",
                type: "text",
                field: {
                    type: "javascript",
                },
                state: "script",
            },
            {
                key: "macro",
                type: "text",
                state: "macro",
            },
        ];
    }

    static get defineCustomInputs(): CustomInputSchema[] | null {
        return [{ slug: "input", array: true }];
    }

    static get defineCustomOutputs(): CustomOutputSchema[] | null {
        return [{ slug: "output", array: true }];
    }

    get icon(): string {
        return "\uf121";
    }

    async _execute(): Promise<boolean> {
        const values = await this.getCustomInputsValues("input");
        const result = await (this.state === "macro" ? this.#executeMacro(values) : this.#executeScript(values));

        if (R.isBoolean(result)) {
            return result;
        }

        const returnedValues = this.parseUserValues(result);
        if (returnedValues.length) {
            this.setCustomOutputValues("output", returnedValues);
        }

        return this.executeNext("out");
    }

    async #executeMacro(values: any[]): Promise<unknown> {
        const uuid = await this.getInputValue("macro");
        const macro = await fromUuid(uuid);
        if (!isScriptMacro(macro)) return;

        return macro.execute({ inputs: values });
    }

    async #executeScript(values: any[]): Promise<unknown> {
        const code = await this.getInputValue("script");

        try {
            const fn = new foundry.utils.AsyncFunction("inputs", code);
            return fn(values);
        } catch (error: any) {}
    }
}

export { ScriptActionNode };
