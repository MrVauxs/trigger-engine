import { IconObject } from "_zod";
import { BridgeSchemaInput, BuiltinsInputEntry } from "engine";
import { MODULE, R, UserPF2e, htmlQuery, localizePath } from "module-helpers";
import { ConfirmDialogQueryOptions } from "queries";
import {
    BaseActionNode,
    DescriptionInputs,
    DescriptionState,
    descriptionSchemas,
    descriptionStates,
    getDescriptionInputs,
    localizeKeyOrDescription,
} from ".";

class AwaitConfirmActionNode extends BaseActionNode<"true" | "false", Inputs, never, never, never, DescriptionState> {
    static TIMEOUT: number = 30;

    static get type(): "await-confirm" {
        return "await-confirm";
    }

    static get tags(): string[] {
        return ["dialog", "user"];
    }

    static get states(): string[] {
        return descriptionStates;
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "title", type: "text" },
            ...descriptionSchemas(),
            {
                key: "timeout",
                type: "number",
                field: {
                    default: this.TIMEOUT,
                    min: 0,
                },
            },
            {
                key: "user",
                type: "user",
            },
        ];
    }

    get icon(): IconObject {
        return {
            fontWeight: "900",
            unicode: "\uf4a2",
        };
    }

    get isEmit(): boolean {
        return true;
    }

    async _execute(): Promise<boolean> {
        const { content, key } = await getDescriptionInputs.call(this);

        if (!content && !key) {
            return this.executeNext("false");
        }

        const userInput = await this.getInputValue("user");
        const user = userInput?.active ? userInput : this.userContext;
        const queryArgs: ConfirmDialogQueryOptions = {
            _type: "confirm-dialog",
            content,
            key,
            timeout: await this.getInputValue("timeout"),
            title: await this.getInputValue("title"),
        };

        const result = await this.queryConfirm(user, queryArgs);
        return this.executeNext(result ? "true" : "false");
    }

    async queryConfirm(user: UserPF2e, args: ConfirmDialogQueryOptions): Promise<boolean> {
        try {
            const result = user.isSelf
                ? await createConfirmDialog(args)
                : await user.query(MODULE.path("user-query"), args, { timeout: args.timeout * 1000 });

            return !!result;
        } catch (error: any) {
            return false;
        }
    }
}

async function createConfirmDialog(options: ConfirmDialogQueryOptions): Promise<boolean | null> {
    if (!R.isString(options.content) && !R.isString(options.key)) return null;

    let intervale: NodeJS.Timeout | undefined;
    let timeout = R.isNumber(options.timeout) ? options.timeout : AwaitConfirmActionNode.TIMEOUT;

    const titleKey = (R.isString(options.title) && options.title) || localizePath("confirm-dialog.title");
    const title = game.i18n.localize(titleKey);

    return foundry.applications.api.DialogV2.confirm({
        content: await localizeKeyOrDescription(options),
        render: (_, dialog) => {
            if (timeout > 0) {
                setTimeout(() => {
                    dialog.close();
                }, timeout * 1000);

                const titleEl = htmlQuery(dialog.element, ".window-header .window-title");
                if (!titleEl) return;

                intervale = setInterval(() => {
                    timeout--;
                    titleEl.innerHTML = `(${timeout}) ${title}`;
                }, 1000);
            }
        },
        close: () => {
            clearInterval(intervale);
        },
        window: {
            title: timeout > 0 ? `(${timeout}) ${title}` : title,
        },
    });
}

type Inputs = DescriptionInputs & {
    timeout: number;
    title: string;
    user?: UserPF2e;
};

export { AwaitConfirmActionNode, createConfirmDialog };
