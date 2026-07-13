import { IconObject } from "_zod";
import { BridgeSchemaInput, BuiltinsInputEntry } from "engine";
import { R, localize } from "foundry-helpers";
import { ConfirmDialogQueryOptions } from "queries";
import {
    AwaitDialogActionNode,
    DescriptionInputsData,
    DescriptionState,
    QueryUserInputs,
    awaitQueryDialog,
    descriptionSchemas,
    descriptionStates,
    getDescriptionData,
    localizeKeyOrDescription,
} from ".";

class AwaitConfirmActionNode extends AwaitDialogActionNode<
    DescriptionInputsData,
    boolean,
    "true" | "false",
    Inputs,
    never,
    never,
    never,
    DescriptionState
> {
    static get type(): "await-confirm" {
        return "await-confirm";
    }

    static get states(): string[] {
        return descriptionStates;
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [...AwaitDialogActionNode.defineInputs, ...descriptionSchemas()];
    }

    get icon(): IconObject {
        return {
            fontWeight: "900",
            unicode: "\uf4a2",
        };
    }

    async _execute(): Promise<boolean> {
        const { content, key, plain } = await getDescriptionData.call(this);

        if (!content && !key && !plain) {
            return this.executeNext("false");
        }

        const result = await this.queryUser({ content, key, plain });
        return this.executeNext(result ? "true" : "false");
    }
}

async function createConfirmDialog(options: ConfirmDialogQueryOptions): Promise<boolean | null> {
    if (!R.isString(options.content) && !R.isString(options.key) && !R.isString(options.plain)) return null;

    return awaitQueryDialog({
        buttons: [
            {
                action: "yes",
                icon: "fa-solid fa-check",
                label: "COMMON.Yes",
                default: false,
                callback: () => true,
            },
            {
                action: "no",
                icon: "fa-solid fa-xmark",
                label: "COMMON.No",
                default: true,
                callback: () => false,
            },
        ],
        content: await localizeKeyOrDescription(options),
        position: { width: 400 },
        timeout: options.timeout,
        title: options.title ? game.i18n.localize(options.title) : localize("confirm-dialog.title"),
    });
}

type Inputs = QueryUserInputs & DescriptionInputsData;

export { AwaitConfirmActionNode, createConfirmDialog };
