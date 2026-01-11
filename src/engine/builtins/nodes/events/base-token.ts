import { BaseEventNode, BuiltinsOutputEntry, SpecialIcon, gmOnlySpecialIcon } from "engine";

abstract class BaseTokenEvent extends BaseEventNode<never, { target: TargetDocuments }> {
    static get tags(): string[] {
        return ["token"];
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [{ key: "target", type: "target" }];
    }

    get specialIcons(): SpecialIcon[] {
        return [gmOnlySpecialIcon];
    }

    async _execute(target: TargetDocuments): Promise<boolean> {
        this.setOutputValue("target", target);
        return this.executeNext("out");
    }
}

export { BaseTokenEvent };
