import { TriggerNode } from "engine";

abstract class BaseValueNode<TInputs extends Record<string, any> = Record<string, any>> extends TriggerNode<
    never,
    TInputs
> {
    static get category(): "value" {
        return "value";
    }

    static get hasIn(): boolean {
        return false;
    }

    static get defineOuts(): null {
        return null;
    }

    static get inputsHaveConnector(): boolean {
        return false;
    }

    get subtitle(): null {
        return null;
    }

    get headerColor(): ColorSource {
        return "#6b5646";
    }
}

export { BaseValueNode };
