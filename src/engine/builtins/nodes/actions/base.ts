import { TriggerNode } from "engine";

abstract class BaseActionNode<
    TOuts extends string | never = string,
    TInputs extends Record<string, any> | never = Record<string, any>,
    TOutputs extends Record<string, any> | never = Record<string, any>,
    TCustomInputs extends string | never = string,
    TCustomOutputs extends string | never = string,
    TState extends string | never = string,
> extends TriggerNode<TOuts, TInputs, TOutputs, TCustomInputs, TCustomOutputs, TState> {
    static get category(): "action" {
        return "action";
    }

    get headerColor(): `#${string}` {
        return "#2162bd";
    }
}

async function localizeKeyOrDescription(key: string | undefined, description: string | undefined): Promise<string> {
    return key
        ? game.i18n.localize(key)
        : foundry.applications.ux.TextEditor.implementation.enrichHTML(description as string);
}

export { BaseActionNode, localizeKeyOrDescription };
