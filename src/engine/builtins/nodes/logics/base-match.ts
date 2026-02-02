import { BaseBooleanLogicNode } from ".";

abstract class BaseMatchLogicNode<TType> extends BaseBooleanLogicNode<{ a: TType; b: TType }> {
    abstract _match(entryA: TType, entryB: TType): boolean;

    async _execute(): Promise<boolean> {
        const entryA = await this.getInputValue("a");
        const entryB = await this.getInputValue("b");
        const result = this._match(entryA, entryB);

        return this.executeNextIf(result);
    }
}

export { BaseMatchLogicNode };
