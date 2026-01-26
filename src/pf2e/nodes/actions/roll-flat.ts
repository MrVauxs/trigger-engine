import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { ZeroToThree } from "module-helpers";
import { PF2eInputEntry, PF2eOutputEntry } from "pf2e";

class RollFlatActionNode extends BaseActionNode<"out", Inputs, Outputs> {
    static get type(): "roll-flat" {
        return "roll-flat";
    }

    static get tags(): string[] {
        return ["chat"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            {
                key: "dc",
                type: "number",
                field: {
                    default: 15,
                    min: 0,
                },
            },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "outcome", type: "outcome" }];
    }

    get icon(): IconObject {
        return { unicode: "\uf6cf" };
    }

    async _execute(): Promise<boolean> {
        const value = await this.getInputValue("dc");
        const target = await this.getInputValue("target");

        if (!target || !value) {
            return this.executeNext("out");
        }

        const label = game.i18n.localize("PF2E.FlatCheck");
        const rolled = await game.pf2e.Check.roll(new game.pf2e.StatisticModifier(label), {
            actor: target.actor,
            type: "flat-check",
            dc: { value, visible: true },
            options: new Set(["flat-check"]),
            skipDialog: true,
        });

        this.setOutputValue("outcome", rolled?.degreeOfSuccess);

        return this.executeNext("out");
    }
}

type Inputs = {
    dc: number;
    target?: TargetDocuments;
};

type Outputs = {
    outcome: Maybe<ZeroToThree>;
};

export { RollFlatActionNode };
