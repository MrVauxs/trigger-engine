import { BaseEventNode, BuiltinsCustomEntry, BuiltinsInputEntry } from "engine";

class HookCalledEvent extends BaseEventNode<Inputs, never, "output"> {
    static get type(): "hook-called-event" {
        return "hook-called-event";
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "name", type: "text" },
            { key: "gm", type: "boolean" },
        ];
    }

    static get defineCustomOutputs(): BuiltinsCustomEntry[] {
        return [{ slug: "output", array: true }];
    }

    _execute(args: any[]): Promise<boolean> {
        this.setCustomOutputValues("output", args);
        return this.executeNext("out");
    }
}

type Inputs = {
    name: string;
};

export { HookCalledEvent };
