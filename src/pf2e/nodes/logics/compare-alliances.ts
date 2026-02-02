import { BaseBooleanLogicNode, BuiltinsInputEntry } from "engine";

const COMPARE_ENTRIES = ["allies", "enemies", "neutral", "different"] as const;

class CompareAlliancesLogicNode extends BaseBooleanLogicNode<Inputs> {
    static get type(): "compare-alliances" {
        return "compare-alliances";
    }

    static get tags(): string[] {
        return ["actor"];
    }

    static get defineInputs(): BuiltinsInputEntry[] {
        return [
            { key: "a", type: "target" },
            { key: "b", type: "target" },
            {
                key: "compare",
                type: "text",
                tooltip: false,
                field: {
                    type: "select",
                    options: COMPARE_ENTRIES,
                    connector: false,
                },
            },
        ];
    }

    async _execute(): Promise<boolean> {
        const entryA = await this.getInputValue("a");
        const entryB = await this.getInputValue("b");

        if (!entryA || !entryB) {
            return this.executeNext(entryA && entryB ? "true" : "false");
        }

        const compare = await this.getInputValue("compare");
        const result = this.#compareAlliances(entryA, entryB, compare);

        return this.executeNextIf(result);
    }

    #compareAlliances(entryA: TargetDocuments, entryB: TargetDocuments, compare: CompareEntry): boolean {
        const actorA = entryA.actor;
        const actorB = entryB.actor;

        switch (compare) {
            case "allies":
                return actorA.isAllyOf(actorB);
            case "enemies":
                return actorA.isEnemyOf(actorB);
            case "different":
                return actorA.alliance !== actorB.alliance;
            case "neutral":
                return actorA.alliance === null && actorB.alliance === null;
        }
    }
}

type Inputs = {
    a?: TargetDocuments;
    b?: TargetDocuments;
    compare: CompareEntry;
};

type CompareEntry = (typeof COMPARE_ENTRIES)[number];

export { CompareAlliancesLogicNode };
