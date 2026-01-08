import { TriggerNode } from "engine";

abstract class BaseValueNode<TInput extends any> extends TriggerNode<never, { input: TInput }> {
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

    get headerColor(): `#${string}` {
        return "#757575";
    }
}

export { BaseValueNode };
