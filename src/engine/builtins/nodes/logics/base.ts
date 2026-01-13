import { NodeEntry, TriggerNode } from "engine";
import { MODULE } from "module-helpers";

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

    static get baseEntry(): typeof NodeEntry<any, any> {
        throw MODULE.Error("'baseEntry' getter must be implemented.");
    }

    static get tags(): string[] {
        return [this.baseEntry.type];
    }

    get headerColor(): ColorSource {
        return (this.constructor as typeof BaseLogicNode).baseEntry.color;
    }

    get subtitle(): null {
        return null;
    }
}

export { BaseLogicNode };
