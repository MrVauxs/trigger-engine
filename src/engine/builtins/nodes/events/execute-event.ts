import { BaseEventNode, BuiltinsCustomOutput, ExecuteEventOptions } from "engine";

class ExecuteEventNode extends BaseEventNode {
    static get type(): "execute-event" {
        return "execute-event";
    }

    static get tags(): string[] {
        return ["macro"];
    }

    static get defineCustomOutputs(): BuiltinsCustomOutput[] {
        return [{ array: true, slug: "output" }];
    }

    get icon(): string {
        return "\uf144";
    }

    async _execute({ converted, values }: ExecuteEventOptions): Promise<boolean> {
        const parsed = converted ? await this.convertValuesFomEmitable(values) : values;
        this.setCustomOutputValues("output", parsed);
        return this.executeNext("out");
    }
}

export { ExecuteEventNode };
