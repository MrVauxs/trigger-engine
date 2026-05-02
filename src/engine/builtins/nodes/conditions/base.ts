import { IconObject } from "_zod";
import { BridgeSchemaInput, TriggerNode } from "engine";
import { PF2eOutputEntry } from "pf2e";

class BaseConditionNode<
    TInputs extends Record<string, any> = Record<string, any>,
    TOutputs extends { boolean: boolean } = { boolean: boolean },
    TCustomInputs extends string = string,
    TCustomOutputs extends string = string,
> extends TriggerNode<"true" | "false" | "out", TInputs, TOutputs, TCustomInputs, TCustomOutputs, "split" | "boolean"> {
    static get category(): string {
        return "condition";
    }

    static get states(): string[] | null {
        return ["split", "boolean"];
    }

    static get defineOuts(): BridgeSchemaInput[] | null {
        return [
            { key: "true", state: "split" },
            { key: "false", state: "split" },
            { key: "out", state: "boolean" },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "boolean", type: "boolean", state: "boolean" }];
    }

    get headerColor(): ColorSource {
        return "#188600";
    }

    get icon(): IconObject | string | null {
        return { unicode: "\ue14f" };
    }

    async execute(out: "true" | "false", ...args: any[]): Promise<boolean> {
        if (this.state === "boolean") {
            this.setOutputValue("boolean", out === "true");
            return this.executeNext("out", ...args);
        } else {
            return this.executeNext(out, ...args);
        }
    }

    async executeIf(condition?: boolean): Promise<boolean> {
        return this.execute(condition ? "true" : "false");
    }
}

export { BaseConditionNode };
