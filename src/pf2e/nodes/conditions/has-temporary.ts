import { BaseConditionNode } from "engine";
import { ItemPF2e, findItemWithSlug } from "module-helpers";
import { PF2eInputEntry, PF2eOutputEntry, TriggerEffectInputs, getTriggerEffectData, triggerEffectSchemas } from "pf2e";

class HasTemporaryConditionNode extends BaseConditionNode<TriggerEffectInputs, Outputs> {
    static get type(): "has-temporary" {
        return "has-temporary";
    }

    static get tags(): string[] {
        return ["effect", "item"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return triggerEffectSchemas();
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [{ key: "item", type: "item" }];
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("false");
        }

        const { slug } = await getTriggerEffectData.call(this);
        const item = findItemWithSlug(actor, slug, "effect");

        if (item) {
            this.setOutputValue("item", item);
            return this.executeNext("true");
        } else {
            return this.executeNext("false");
        }
    }
}

type Outputs = {
    item?: ItemPF2e;
};

export { HasTemporaryConditionNode };
