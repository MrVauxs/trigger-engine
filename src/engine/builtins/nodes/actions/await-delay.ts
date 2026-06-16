import { BuiltinsInputEntry, BuiltinsOutputEntry } from "engine/builtins/entries";
import { BaseActionNode } from ".";
import { IconObject } from "_zod";
import { waitTimeout } from "foundry-helpers";

class AwaitDelayActionNode extends BaseActionNode<"out", Inputs, Outputs, never, never, "delay" | "repeat"> {
    static get type(): "await-delay" {
        return "await-delay";
    }

    static get tags(): string[] {
        return ["time"];
    }

    static get states(): string[] {
        return ["delay", "repeat"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            {
                key: "delay",
                type: "number",
                field: {
                    default: 100,
                    min: 0,
                    step: 1,
                },
            },
            {
                key: "repeat",
                type: "number",
                state: "repeat",
                field: {
                    default: 2,
                    min: 1,
                    max: 10,
                    step: 1,
                },
            },
            { key: "start", type: "boolean", state: "repeat" },
        ];
    }

    static get defineOutputs(): BuiltinsOutputEntry[] {
        return [{ key: "index", type: "number", state: "repeat" }];
    }

    get title(): string {
        return this.localize(this.state === "delay" ? "title" : `titles.${this.state}`) as string;
    }

    get isLoop(): boolean {
        return this.state === "repeat";
    }

    get specialIcons(): { icon: IconObject; name?: string }[] {
        return [{ icon: { unicode: "\uf017" }, name: "delay" }];
    }

    get icon(): IconObject {
        return { unicode: "\uf120" };
    }

    async _execute(): Promise<boolean> {
        const delay = await this.getInputValue("delay");
        const repeat = this.state === "repeat" ? await this.getInputValue("repeat") : 1;

        if (repeat === 1) {
            await waitTimeout(delay);
            return this.executeNext("out");
        }

        let index = Number(await this.getInputValue("start"));
        const limit = repeat + index;

        await new Promise((resolve) => {
            const interval = setInterval(async () => {
                this.setOutputValue("index", index++);

                const keepExecuting = await this.executeNext("out");

                if (!keepExecuting || index === limit) {
                    clearInterval(interval);
                }
            }, delay);
        });

        return true;
    }
}

type Inputs = {
    delay: number;
    repeat: number;
    start: boolean;
};

type Outputs = {
    index: number;
};

export { AwaitDelayActionNode };
