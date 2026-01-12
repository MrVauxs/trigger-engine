import { BaseEventNode, BuiltinsOutputEntry } from "engine";

abstract class BaseTokenEvent extends BaseEventNode<never, { target: TargetDocuments }> {
    static get tags(): string[] {
        return ["token"];
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [{ key: "target", type: "target" }];
    }

    async _execute(target: TargetDocuments): Promise<boolean> {
        this.setOutputValue("target", target);
        return this.executeNext("out");
    }
}

export { BaseTokenEvent };
