import { BaseMatchLogicNode, BuiltinsInputEntry } from "engine";

class TextsMatchLogicNode extends BaseMatchLogicNode<string> {
    static get type(): "texts-match" {
        return "texts-match";
    }

    static get tags(): string[] {
        return ["text"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            {
                key: "a",
                type: "text",
                field: { trim: false },
            },
            {
                key: "b",
                type: "text",
                field: { trim: false },
            },
        ];
    }

    _match(entryA: string, entryB: string): boolean {
        return entryA === entryB;
    }
}

export { TextsMatchLogicNode };
