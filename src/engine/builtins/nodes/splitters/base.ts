import { BridgeSchemaInput, TriggerNode } from "engine";

abstract class BaseSplitterNode<
    TOuts extends string = string,
    TInput extends any = any,
    TOutputs extends Record<string, any> = Record<string, any>,
> extends TriggerNode<TOuts, { input: TInput }, TOutputs, never, never, never> {
    static get category(): string {
        return "splitter";
    }

    static get defineOuts(): BridgeSchemaInput[] | null {
        return null;
    }

    static get inputsHaveField(): boolean {
        return false;
    }

    get headerColor(): ColorSource {
        return "#853667";
    }

    get subtitle(): null {
        return null;
    }
}

export { BaseSplitterNode };
