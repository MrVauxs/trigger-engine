import { BaseActionNode } from "engine";
import {
    CreateEffectActionNode,
    CreateEffectOutputs,
    createEmbeddedItem,
    CreateItemActionNode,
    CreateItemInputs,
} from ".";
import { getDoubleUuidValue, PF2eInputEntry, PF2eOutputEntry } from "pf2e";
import { IconObject } from "_zod";
import { EffectPF2e, getDocumentFromUUID, getItemSource, ItemPF2e, localize, R } from "foundry-helpers";

class CreateEffectSourceActionNode extends BaseActionNode<"out", Inputs, Outputs> {
    static get type(): "create-effect-source" {
        return "create-effect-source";
    }

    static get tags(): string[] {
        return ["effect", "item"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            ...CreateItemActionNode.defineInputs.filter((x) => x.key !== "duplicate"),
            {
                key: "counter",
                type: "number",
                tooltip: localize.path("builtins.shared.numbers.override.tooltip"),
            },
            { key: "origin", type: "target", group: "origin" },
            { key: "item", type: "item", group: "origin" },
            { key: "options", type: "text", group: "origin", isArray: true },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return CreateEffectActionNode.defineOutputs;
    }

    get icon(): IconObject {
        return { unicode: "\uf890" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;
        const uuid = await getDoubleUuidValue.call(this);
        const item = await getDocumentFromUUID("Item", uuid);

        if (!actor || !item?.isOfType("effect")) {
            return this.executeNext("out");
        }

        const source = getItemSource(item);
        const level = await this.getInputValue("level");
        const origin = await this.getInputValue("origin");

        // we override the level if needed
        if (level > 0) {
            source.system.level.value = level;
        }

        // we override the counter if possible
        if (R.isNumber(source.system.badge?.value)) {
            const counter = await this.getInputValue("counter");

            if (counter > 0) {
                source.system.badge.value = counter;
            }
        }

        // we set the origin if needed
        if (origin) {
            const { actor, token } = origin;

            source.system.context = {
                origin: {
                    actor: actor?.uuid,
                    item: (await this.getInputValue("item"))?.uuid ?? null,
                    rollOptions: await this.getInputValue("options"),
                    spellcasting: null,
                    token: token?.uuid ?? actor.token?.uuid ?? null,
                },
                roll: null,
                target: null,
            };
        }

        // we create the effect
        const created = await createEmbeddedItem<EffectPF2e>(actor, source);
        if (created) {
            this.setOutputValue("effect", created);
        }

        return this.executeNext("out");
    }
}

type Inputs = Omit<CreateItemInputs, "duplicate"> & {
    counter: number;
    item?: ItemPF2e;
    options: string[];
    origin?: TargetDocuments;
};

type Outputs = CreateEffectOutputs;

export { CreateEffectSourceActionNode };
