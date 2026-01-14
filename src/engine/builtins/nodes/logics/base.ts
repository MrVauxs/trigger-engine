import { TriggerNode } from "engine";

abstract class BaseLogicNode<
    TOuts extends string = string,
    TInputs extends Record<string, any> = Record<string, any>,
    TOutputs extends Record<string, any> = Record<string, any>,
    TCustomInputs extends string = string,
    TCustomOutputs extends string = string,
    TState extends string = string,
> extends TriggerNode<TOuts, TInputs, TOutputs, TCustomInputs, TCustomOutputs, TState> {
    static get category(): "logic" {
        return "logic";
    }

    get headerColor(): ColorSource {
        return "#7e18b5";
    }

    get subtitle(): null {
        return null;
    }
}

export { BaseLogicNode };
