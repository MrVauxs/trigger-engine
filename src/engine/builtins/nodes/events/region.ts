import { OutputEntrySchemaSource, TriggerNode } from "engine";

class RegionEventNode extends TriggerNode<"out", never, Outputs> {
    static get type(): "region-event" {
        return "region-event";
    }

    static get isEvent(): boolean {
        return true;
    }

    static get tags(): string[] {
        return ["region"];
    }

    static get defineOutputs(): OutputEntrySchemaSource[] {
        return [
            {
                key: "target",
                type: "target",
            },
            {
                key: "event",
                type: "text",
            },
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

type RegionEventOptions = {
    eventName: string;
    target: TargetDocuments;
};

export { RegionEventNode };
export type { RegionEventOptions };
