import { TriggerNode } from "engine";

abstract class BaseExtractorNode<TInput extends any = any, TCustomOutputs extends string = string> extends TriggerNode<
    "out",
    { input: TInput },
    any,
    never,
    TCustomOutputs,
    never
> {
    static get category(): string {
        return "extractor";
    }

    get headerColor(): ColorSource {
        return "#86910d";
    }

    get subtitle(): null {
        return null;
    }
}

export { BaseExtractorNode };
