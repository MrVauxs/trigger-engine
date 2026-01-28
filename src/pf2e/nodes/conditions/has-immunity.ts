import { BaseConditionNode } from "engine";
import { ImmunityType, objectHasKey, R, recordToSelectOptions } from "module-helpers";
import { PF2eInputEntry } from "pf2e";

let IMMUNITIES: ImmunityOptions | undefined;

class HasImmunityConditionNode extends BaseConditionNode<Inputs> {
    static get type(): "has-immunity" {
        return "has-immunity";
    }

    static get defineInputs(): PF2eInputEntry[] {
        const options = (IMMUNITIES ??= recordToSelectOptions(
            R.omit(CONFIG.PF2E.immunityTypes, ["custom"]),
        ) as ImmunityOptions);

        return [
            { key: "target", type: "target" },
            {
                key: "type",
                type: "text",
                label: "PF2E.Actor.IWREditor.Type",
                tooltip: false,
                field: {
                    type: "select",
                    options,
                },
            },
        ];
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("false");
        }

        const type = await this.getInputValue("type");
        const options = objectHasKey(CONFIG.PF2E.conditionTypes, type)
            ? ["item:type:condition", `item:slug:${type}`]
            : objectHasKey(CONFIG.PF2E.damageTypes, type)
              ? [`damage:type:${type}`]
              : objectHasKey(CONFIG.PF2E.materialDamageEffects, type)
                ? [`damage:material:${type}`]
                : [];

        const hasImmunity = !!actor?.system.attributes.immunities.some((immunity) => {
            return immunity.type === type || immunity.test(options);
        });

        return this.executeNextIf(hasImmunity);
    }
}

type Inputs = {
    target?: TargetDocuments;
    type: Exclude<ImmunityType, "custom">;
};

type ImmunityOptions = { value: ImmunityType; label: string }[];

export { HasImmunityConditionNode };
