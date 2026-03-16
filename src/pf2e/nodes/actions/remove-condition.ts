import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { R } from "foundry-helpers";
import { PF2eInputEntry } from "pf2e";
import { ConditionsInputs, conditionsSchemas } from ".";

class RemoveConditionActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "remove-condition" {
        return "remove-condition";
    }

    static get tags(): string[] {
        return ["condition"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return conditionsSchemas().slice(0, -1);
    }

    get icon(): IconObject {
        return { unicode: "\ue5d1", fontWeight: "900" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("out");
        }

        const slug = await this.getInputValue("condition");

        const conditions = R.pipe(
            actor.itemTypes.condition,
            R.filter((item) => item.slug === slug && !item.isLocked),
            R.map((item) => item.id),
        );

        if (conditions.length) {
            await actor.deleteEmbeddedDocuments("Item", conditions);
        }

        return this.executeNext("out");
    }
}

type Inputs = Omit<ConditionsInputs, "value">;

export { RemoveConditionActionNode };
