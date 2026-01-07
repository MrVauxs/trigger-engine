import { BaseEventNode, CustomOutputSchema } from "engine";

class ExecuteEventNode extends BaseEventNode {
    static get type(): "execute-event" {
        return "execute-event";
    }

    static get tags(): string[] {
        return ["macro"];
    }

    static get defineCustomOutputs(): CustomOutputSchema[] {
        return [{ array: true, slug: "output" }];
    }

    get icon(): string {
        return "\uf144";
    }

    _execute({ userId, values }: ExecuteEventOptions): Promise<boolean> {
        // TODO create a user entry
        this.setCustomOutputValues("output", values);
        return this.executeNext("out");
    }
}

type ExecuteEventOptions = {
    userId: string;
    values: any[];
};

export { ExecuteEventNode };
export type { ExecuteEventOptions };
