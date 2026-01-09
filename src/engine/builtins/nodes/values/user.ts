import { UserPF2e } from "module-helpers";
import { BaseValueNode } from ".";
import { BuiltinsInputEntry, BuiltinsOutputEntry } from "engine";

class UserValueNode extends BaseValueNode<{ id: string }> {
    static get type(): "user-value" {
        return "user-value";
    }

    static get tags(): string[] {
        return ["user"];
    }

    static get defineInputs(): [BuiltinsInputEntry] {
        const options = game.users.map((user): SelectOption => {
            return { value: user.id, label: user.name };
        });

        return [
            {
                key: "id",
                type: "text",
                field: {
                    options,
                    tooltip: false,
                    type: "select",
                },
            },
        ];
    }

    static get defineOutputs(): [BuiltinsOutputEntry] {
        return [{ key: "user", type: "user" }];
    }

    async _query(): Promise<UserPF2e | undefined> {
        const id = await this.getInputValue("id");
        return game.users.get(id);
    }
}

export { UserValueNode };
