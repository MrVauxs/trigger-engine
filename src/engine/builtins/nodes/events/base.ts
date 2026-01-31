import { TriggerNode } from "engine";

class BaseEventNode<
    TInputs extends Record<string, any> | never = Record<string, any>,
    TOutputs extends Record<string, any> | never = Record<string, any>,
    TCustomOutputs extends string | never = string,
    TState extends string | never = string,
> extends TriggerNode<"out", TInputs, TOutputs, never, TCustomOutputs, TState> {
    static get isEvent(): boolean {
        return true;
    }
}

export { BaseEventNode };
