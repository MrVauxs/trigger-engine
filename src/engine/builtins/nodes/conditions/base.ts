import { IconObject } from "_zod";
import { BridgeSchemaInput, TriggerNode } from "engine";

class BaseConditionNode<
    TInputs extends Record<string, any> = Record<string, any>,
    TOutputs extends Record<string, any> = Record<string, any>,
    TCustomInputs extends string = string,
    TCustomOutputs extends string = string,
    TState extends string = string,
> extends TriggerNode<"true" | "false", TInputs, TOutputs, TCustomInputs, TCustomOutputs, TState> {
    static get category(): string {
        return "condition";
    }

    static get defineOuts(): BridgeSchemaInput[] | null {
        return [{ key: "true" }, { key: "false" }];
    }

    get headerColor(): ColorSource {
        return "#188600";
    }

    get icon(): IconObject | string | null {
        return { unicode: "\ue14f" };
    }

    async executeNextIf(condition?: boolean): Promise<boolean> {
        return this.executeNext(condition ? "true" : "false");
    }
}

export { BaseConditionNode };
