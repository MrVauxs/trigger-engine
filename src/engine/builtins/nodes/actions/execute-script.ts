import { BuiltinsCustomOutput, BuiltinsInputEntry, CustomInputSchema } from "engine";
import { R, isScriptMacro } from "module-helpers";
import { BaseActionNode } from ".";
import { IconObject } from "_zod";

class ExecuteScriptActionNode extends BaseActionNode<
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

    static get defineCustomOutputs(): BuiltinsCustomOutput[] | null {
        return [{ slug: "output", array: true }];
    }

    get title(): string | null {
        return this.localMacro?.name ?? super.title;
    }

    get subtitle(): string | null {
        return !!this.localMacro ? super.title : super.subtitle;
    }

    get icon(): IconObject | string {
        const macro = this.localMacro;
        return macro === null ? { unicode: "\uf127" } : (macro?.img ?? { unicode: "\uf121" });
    }

    get localMacro(): CompendiumIndexData | undefined | null {
        if (this.state !== "macro") return;

        const uuid = this.getLocalValue("macro");
        if (!uuid) return;

        const macro = fromUuidSync<CompendiumIndexData>(uuid ?? "");
        if (!macro) return null;

        return isScriptMacro(macro) || foundry.utils.parseUuid(macro.uuid)?.type === "Macro" ? macro : null;
    }

    async _execute(): Promise<boolean> {
        const values = await this.getCustomInputsValues("input");
        const result = await (this.state === "macro" ? this.#executeMacro(values) : this.#executeScript(values));

        if (R.isBoolean(result)) {
            return result;
        }

        const returnedValues = this.parseUserValues(result).map((x) => x?.value);
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

export { ExecuteScriptActionNode };
