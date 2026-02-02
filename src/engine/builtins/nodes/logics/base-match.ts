import { BaseLogicNode, BridgeSchemaInput } from "engine";

abstract class BaseMatchLogicNode<TType> extends BaseLogicNode<"true" | "false", { a: TType; b: TType }> {
    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    abstract _match(entryA: TType, entryB: TType): boolean;

    async _execute(): Promise<boolean> {
        const entryA = await this.getInputValue("a");
        const entryB = await this.getInputValue("b");
        const result = this._match(entryA, entryB);

        return this.executeNext(result ? "true" : "false");
    }
}

export { BaseMatchLogicNode };
