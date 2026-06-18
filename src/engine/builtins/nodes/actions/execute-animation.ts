import { BuiltinsCustomEntry, BuiltinsInputEntry, UserValue } from "engine";
import { BaseActionNode } from ".";
import { IconObject } from "_zod";
import { R } from "foundry-helpers";

class ExecuteAnimationActionNode extends BaseActionNode<"out", Inputs, never, "input"> {
    static get type(): "execute-animation" {
        return "execute-animation";
    }

    static get tags(): string[] {
        return ["animation"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "name", type: "text" },
            { key: "actor", type: "target" },
            { key: "sources", type: "any", isArray: true },
            { key: "targets", type: "any", isArray: true },
            { key: "item", type: "item" },
            { key: "options", type: "text", isArray: true },
            { key: "await", type: "boolean" },
        ];
    }

    static override get defineCustomInputs(): BuiltinsCustomEntry[] {
        return [
            {
                group: "custom",
                slug: "input",
                types: ["any", "boolean", "item", "number", "point", "target", "text", "user"],
                array: true,
            },
        ];
    }

    get headerColor(): ColorSource {
        return "#009690";
    }

    get icon(): IconObject {
        return { unicode: "\uf03d" };
    }

    async _execute(): Promise<boolean> {
        if (!R.isFunction(triggerAnimations?.api?.runFromTrigger)) {
            return this.executeNext("out");
        }

        const animationCall = triggerAnimations.api.runFromTrigger({
            actor: await this.getInputValue("actor"),
            item: await this.getInputValue("item"),
            name: await this.getInputValue("name"),
            options: await this.getInputValue("options"),
            sources: await this.getInputValue("sources"),
            targets: await this.getInputValue("targets"),
            userInputs: await this.getCustomInputs("input"),
        });

        if (await this.getInputValue("await")) {
            await animationCall;
        }

        return this.executeNext("out");
    }
}

type Inputs = {
    actor?: TargetDocuments;
    await: boolean;
    item?: Item;
    name: string;
    options: string[];
    sources: any[];
    targets: any[];
};

declare global {
    namespace triggerAnimations {
        namespace api {
            function runFromTrigger(data: StartNodeOptions): Promise<void>;
        }

        type StartNodeOptions = {
            name: string;
            actor: TargetDocuments | undefined;
            item: Item | undefined;
            targets: any[];
            sources: any[];
            options: string[];
            userInputs: UserValue[];
        };
    }
}

export { ExecuteAnimationActionNode };
