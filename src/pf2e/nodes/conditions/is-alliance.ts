import { BaseConditionNode } from "engine";
import { PF2eInputEntry } from "pf2e";

class IsAllianceConditionNode extends BaseConditionNode<Inputs> {
    static get type(): "is-alliance" {
        return "is-alliance";
    }

    static get tags(): string[] {
        return ["actor"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            {
                key: "alliance",
                type: "text",
                field: {
                    type: "select",
                    options: [
                        { value: "party", label: "PF2E.Actor.Creature.Alliance.Party" },
                        { value: "opposition", label: "PF2E.Actor.Creature.Alliance.Opposition" },
                        { value: "neutral", label: "PF2E.Actor.Creature.Alliance.Neutral" },
                    ],
                },
            },
        ];
    }

    async _execute(): Promise<boolean> {
        const target = await this.getInputValue("target");

        if (!target) {
            return this.execute("false");
        }

        const alliance = await this.getInputValue("alliance");
        const result = (target.actor.alliance ?? "neutral") === alliance;

        return this.executeIf(result);
    }
}

type Inputs = {
    alliance: "party" | "opposition" | "neutral";
    target?: TargetDocuments;
};

export { IsAllianceConditionNode };
