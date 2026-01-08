import { UserPF2e } from "module-helpers";
import { BaseValueNode } from ".";
import { BuiltinsInputEntry, BuiltinsOutputEntry } from "engine";

class UserValueNode extends BaseValueNode<string> {
    static get type(): "user-value" {
        return "user-value";
    }

    static get tags(): string[] {
        return ["user"];
    }

    static get defineInputs(): [BuiltinsInputEntry] {
        return [
            {
                key: "input",
                type: "text",
                field: {
                    options: {
                        label: "name",
                        path: "game.users",
                        value: "id",
                    },
                    tooltip: false,
                    type: "select",
                },
            },
        ];
    }

    static get defineOutputs(): [BuiltinsOutputEntry] {
        return [{ key: "output", type: "user" }];
    }

    async _query(): Promise<UserPF2e | undefined> {
        const id = await this.getInputValue("input");
        return game.users.get(id);
    }
}

export { UserValueNode };
