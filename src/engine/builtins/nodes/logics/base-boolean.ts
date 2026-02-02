import { BaseLogicNode, BridgeSchemaInput } from "engine";

abstract class BaseBooleanLogicNode<TInputs extends Record<string, any> = Record<string, any>> extends BaseLogicNode<
    "true" | "false",
    TInputs
> {
    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    async executeNextIf(condition?: boolean): Promise<boolean> {
        return this.executeNext(condition ? "true" : "false");
    }
}

export { BaseBooleanLogicNode };
