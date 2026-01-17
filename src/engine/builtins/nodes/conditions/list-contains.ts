import { BuiltinsInputEntry } from "engine";
import { R } from "module-helpers";
import { BaseConditionNode } from ".";

class ListContainsConditionNode extends BaseConditionNode<Inputs> {
    static get type(): "list-contains" {
        return "list-contains";
    }

    static get tags(): string[] {
        return ["option"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "list", type: "text", isArray: true },
            { key: "entry", type: "text" },
        ];
    }

    async _execute(): Promise<boolean> {
        const entry = await this.getInputValue("entry");
        const list = await this.getInputValue("list");
        const result = R.isIncludedIn(entry, list);

        return this.executeNextIf(result);
    }
}

type Inputs = {
    entry: string;
    list: string[];
};

export { ListContainsConditionNode };
