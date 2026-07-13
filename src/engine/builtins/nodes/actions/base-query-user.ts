import { BuiltinsInputEntry } from "engine/builtins/entries";
import { htmlQuery, localize, MODULE, UserPF2e, WaitDialogOptions } from "foundry-helpers";
import { onUserQuery } from "queries";
import { BaseActionNode } from ".";

class AwaitDialogActionNode<
    TQueryArgs extends Record<string, any> = Record<string, any>,
    TQueryResult extends any = any,
    TOuts extends string | never = string,
    TInputs extends QueryUserInputs = QueryUserInputs,
    TOutputs extends Record<string, any> | never = Record<string, any>,
    TCustomInputs extends string | never = string,
    TCustomOutputs extends string | never = string,
    TState extends string | never = string,
> extends BaseActionNode<TOuts, TInputs, TOutputs, TCustomInputs, TCustomOutputs, TState> {
    static TIMEOUT: number = 30;

    static get tags(): string[] {
        return ["dialog", "user"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "title", type: "text" },
            { key: "user", type: "user" },
            {
                key: "timeout",
                type: "number",
                tooltip: localize.path("builtins.shared.numbers.disable.tooltip"),
                field: {
                    default: this.TIMEOUT,
                    min: 0,
                },
            },
        ];
    }

    get isEmit(): boolean {
        return true;
    }

    async queryUser(args: TQueryArgs): Promise<TQueryResult | null> {
        const userInput = await this.getInputValue("user");
        const user = userInput?.active ? userInput : this.userContext;

        const queryArgs: TQueryArgs & QueryUserArgs = {
            ...args,
            _type: (this.constructor as typeof AwaitDialogActionNode).type,
            timeout: await this.getInputValue("timeout"),
            title: await this.getInputValue("title"),
        };

        try {
            const result = user.isSelf
                ? await onUserQuery(queryArgs as any)
                : await user.query(MODULE.path("user-query"), queryArgs, { timeout: queryArgs.timeout * 1000 });

            return result as TQueryResult;
        } catch (error: any) {
            return null;
        }
    }
}

async function awaitQueryDialog<TQueryResult>(options: {
    buttons: foundry.applications.api.DialogV2Button[];
    content: string;
    position?: Partial<foundry.applications.ApplicationPosition>;
    timeout: number;
    title: string;
}): Promise<TQueryResult | null> {
    let intervale: NodeJS.Timeout | undefined;
    let timeout = options.timeout ?? AwaitDialogActionNode.TIMEOUT;

    const title = game.i18n.localize(options.title);

    const dialogOptions: WaitDialogOptions = {
        content: options.content,
        buttons: options.buttons,
        render: (_, dialog) => {
            if (timeout <= 0) return;

            setTimeout(() => {
                dialog.close();
            }, timeout * 1000);

            const titleEl = htmlQuery(dialog.element, ".window-header .window-title");
            if (!titleEl) return;

            intervale = setInterval(() => {
                timeout--;
                titleEl.innerHTML = `(${timeout}) ${title}`;
            }, 1000);
        },
        close: () => {
            clearInterval(intervale);
        },
        position: options.position,
        window: {
            title: timeout > 0 ? `(${timeout}) ${title}` : title,
        },
    };

    return foundry.applications.api.DialogV2.wait(dialogOptions) as Promise<TQueryResult | null>;
}

type QueryUserArgs<T extends string = string> = {
    _type: T;
    timeout: number;
    title: string;
};

type QueryUserInputs = {
    timeout: number;
    title: string;
    user?: UserPF2e;
};

export { AwaitDialogActionNode, awaitQueryDialog };
export type { QueryUserArgs, QueryUserInputs };
