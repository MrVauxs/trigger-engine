import { BaseEventNode, BuiltinsOutputEntry, RegionEventOptions } from "engine";

class RegionEventNode extends BaseEventNode<never, Outputs> {
    static get type(): "region-event" {
        return "region-event";
    }

    static get tags(): string[] {
        return ["region"];
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [
            { key: "target", type: "target" },
            { key: "event", type: "text" },
        ];
    }

    get icon(): string {
        return "\uf867";
    }

    _execute({ eventName, target }: RegionEventOptions): Promise<boolean> {
        this.setOutputValue("event", eventName);
        this.setOutputValue("target", target);
        return this.executeNext("out");
    }
}

type Outputs = {
    event: string;
    target: TargetDocuments;
};

export { RegionEventNode };
