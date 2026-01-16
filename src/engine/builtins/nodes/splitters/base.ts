import { TriggerNode } from "engine";

abstract class BaseSplitterNode<
    TOuts extends string = string,
    TInputs extends Record<string, any> = Record<string, any>,
    TOutputs extends Record<string, any> = Record<string, any>,
    TCustomInputs extends string = string,
    TCustomOutputs extends string = string,
    TState extends string = string,
> extends TriggerNode<TOuts, TInputs, TOutputs, TCustomInputs, TCustomOutputs, TState> {
    static get category(): string {
        return "splitter";
    }

    get headerColor(): ColorSource {
        return "#853667";
    }

    get subtitle(): null {
        return null;
    }
}

export { BaseSplitterNode };
