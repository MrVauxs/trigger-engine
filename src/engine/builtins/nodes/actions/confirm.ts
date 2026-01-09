import { IconObject } from "_zod";
import { BridgeSchemaInput, BuiltinsInputEntry } from "engine";
import { BaseActionNode } from ".";

class ConfirmActionNode extends BaseActionNode<"true" | "false"> {
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
            { key: "key", state: "localization", type: "text" },
            {
                field: {
                    type: "enriched",
                },
                key: "content",
                state: "description",
                type: "text",
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
        return this.executeNext("true");
    }
}

export { ConfirmActionNode };
