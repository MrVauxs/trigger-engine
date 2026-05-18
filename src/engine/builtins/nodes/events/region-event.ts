import { IconObject } from "_zod";
import { BaseEventNode, BuiltinsOutputEntry, RegionEventOptions } from "engine";

class RegionEvent extends BaseEventNode<never, Outputs> {
    static get type(): "region-event" {
        return "region-event";
    }

    static get tags(): string[] {
        return ["region"];
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [
            { key: "attachment", type: "target" },
            { key: "target", type: "target" },
            { key: "event", type: "text" },
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf867" };
    }

    _execute({ attachment, eventName, target }: RegionEventOptions): Promise<boolean> {
        this.sceneContext = target.token;
        this.setOutputValue("attachment", attachment);
        this.setOutputValue("event", eventName);
        this.setOutputValue("target", target);
        return this.executeNext("out");
    }
}

type Outputs = {
    attachment?: TargetDocuments;
    event: string;
    target: TargetDocuments;
};

export { RegionEvent };
