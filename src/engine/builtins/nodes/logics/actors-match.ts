import { BaseMatchLogicNode, BuiltinsInputEntry } from "engine";

class ActorsMatchLogicNode extends BaseMatchLogicNode<TargetDocuments | undefined> {
    static get type(): "actors-match" {
        return "actors-match";
    }

    static get tags(): string[] {
        return ["actor"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "a", type: "target" },
            { key: "b", type: "target" },
        ];
    }

    _match(entryA: TargetDocuments | undefined, entryB: TargetDocuments | undefined): boolean {
        return entryA?.actor.uuid === entryB?.actor.uuid;
    }
}

export { ActorsMatchLogicNode };
