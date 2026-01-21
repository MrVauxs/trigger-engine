import { IconObject } from "_zod";
import { BaseActionNode } from "engine";
import { DamageType, createPersistentDamageSource, recordToSelectOptions } from "module-helpers";
import { PF2eInputEntry } from "pf2e";
import { effectSchemas } from ".";

class CreatePersistentActionNode extends BaseActionNode<"out", Inputs> {
    static get type(): "create-persistent" {
        return "create-persistent";
    }

    static get tags(): string[] {
        return ["condition", "effect", "item", "damage"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            {
                key: "die",
                type: "text",
                field: { default: "1d6" },
            },
            {
                key: "type",
                type: "text",
                field: {
                    type: "select",
                    options: recordToSelectOptions(CONFIG.PF2E.damageTypes),
                },
            },
            {
                key: "dc",
                type: "number",
                field: {
                    default: 15,
                    min: 0,
                },
            },
            ...effectSchemas("effect"),
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf780" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("out");
        }

        const dc = await this.getInputValue("dc");
        const die = await this.getInputValue("die");
        const type = await this.getInputValue("type");
        const source = createPersistentDamageSource(die, type, dc);

        await actor.createEmbeddedDocuments("Item", [source]);

        return this.executeNext("out");
    }
}

type Inputs = {
    dc: number;
    die: string;
    target?: TargetDocuments;
    type: DamageType;
};

export { CreatePersistentActionNode };
