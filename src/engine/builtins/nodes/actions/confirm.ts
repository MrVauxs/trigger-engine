import { IconObject } from "_zod";
import { BridgeSchemaInput, BuiltinsInputEntry } from "engine";
import { MODULE, R, UserPF2e, htmlQuery, localizePath } from "module-helpers";
import { ConfirmDialogQueryOptions } from "queries";
import { BaseActionNode } from ".";

class ConfirmActionNode extends BaseActionNode<
    "true" | "false",
    Inputs,
    never,
    never,
    never,
    "localization" | "description"
> {
    static TIMEOUT: number = 30;

    static get type(): "await-confirm" {
        return "await-confirm";
    }

    static get tags(): string[] {
        return ["dialog", "user"];
    }

    static get states(): string[] {
        return ["description", "localization"];
    }

    static get defineOuts(): BridgeSchemaInput[] {
        return [{ key: "true" }, { key: "false" }];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "title", type: "text" },
            {
                key: "key",
                type: "text",
                state: "localization",
            },
            {
                key: "content",
                type: "text",
                field: { type: "enriched" },
                state: "description",
            },
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

    async _execute(): Promise<boolean> {
        const content = this.state === "description" ? await this.getInputValue("content") : undefined;
        const key = this.state === "localization" ? await this.getInputValue("key") : undefined;

        if (!content && !key) {
            return this.executeNext("false");
        }

        const user = (await this.getInputValue("user")) ?? this.userContext;
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
                : await user.query(MODULE.path("user-query"), args);

            return !!result;
        } catch (error: any) {
            return false;
        }
    }
}

async function createConfirmDialog(options: ConfirmDialogQueryOptions): Promise<boolean | null> {
    if (!R.isString(options.content) && !R.isString(options.key)) return null;

    let intervale: NodeJS.Timeout | undefined;
    let timeout = R.isNumber(options.timeout) ? options.timeout : ConfirmActionNode.TIMEOUT;

    const titleKey = (R.isString(options.title) && options.title) || localizePath("confirm-dialog.title");
    const title = game.i18n.localize(titleKey);

    const content = options.key
        ? game.i18n.localize(options.key)
        : await foundry.applications.ux.TextEditor.implementation.enrichHTML(options.content as string);

    return foundry.applications.api.DialogV2.confirm({
        content,
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

type Inputs = {
    content: string;
    key: string;
    timeout: number;
    title: string;
    user: UserPF2e | undefined;
};

export { ConfirmActionNode, createConfirmDialog };
