import { BaseEventNode, SpecialIcon, gmOnlySpecialIcon } from "engine";
import { PF2eOutputEntry } from "pf2e";

abstract class BaseTokenEvent extends BaseEventNode<never, { target: TargetDocuments }> {
    static get tags(): string[] {
        return ["token"];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
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
