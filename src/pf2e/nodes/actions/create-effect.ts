import { IconObject } from "_zod";
import { BaseActionNode, CustomInputSchema, JsonField } from "engine";
import { R, RuleElementSource, createCustomEffect, localizePath } from "module-helpers";
import { DurationState, EffectInputs, createEmbeddedItem, durationStates, effectSchemas, getEffectData } from ".";
import { PF2eInputEntry } from "pf2e";

class CreateEffectActionNode extends BaseActionNode<"out", Inputs, never, "rule", never, DurationState> {
    static get type(): "create-effect" {
        return "create-effect";
    }

    static get tags(): string[] {
        return ["duration", "effect", "item"];
    }

    static get states(): string[] {
        return [...durationStates];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            ...R.splice(effectSchemas(), 3, 0, [
                {
                    key: "counter",
                    type: "number",
                    tooltip: localizePath("builtins.shared.numbers.disable.tooltip"),
                    field: { min: 0 },
                },
            ]),
        ];
    }

    static get defineCustomInputs(): CustomInputSchema[] {
        return [
            {
                slug: "rule",
                types: ["text"],
                group: "rule",
                field: { type: "json" },
            } satisfies CustomInputSchema<JsonField>,
        ];
    }

    get icon(): IconObject {
        return { unicode: "\uf890" };
    }

    async _execute(): Promise<boolean> {
        const actor = (await this.getInputValue("target"))?.actor;

        if (!actor) {
            return this.executeNext("out");
        }

        const effect = await getEffectData.call(this);
        const ItemCls = getDocumentClass("Item");
        const parent = new ItemCls({ type: "effect", name: "fake" }, { parent: actor });
        const counter = await this.getInputValue("counter");

        const rules = R.pipe(
            await this.getCustomInputsValues("rule"),
            R.map((raw) => {
                try {
                    return JSON.parse(raw);
                } catch (error: any) {}
            }),
            R.filter((source): source is RuleElementSource => {
                const RuleCls = R.isString(source.key) ? game.pf2e.RuleElements.builtin[source.key] : null;
                return !!RuleCls && !new RuleCls(source, { parent }).invalid;
            }),
        );

        const source = createCustomEffect({
            ...effect,
            badge: counter > 0 ? { type: "counter", value: counter } : undefined,
            name: effect.name || game.i18n.localize("TYPES.Item.effect"),
            rules,
        });

        await createEmbeddedItem(actor, source);

        return this.executeNext("out");
    }
}

type Inputs = EffectInputs & {
    counter: number;
    target?: TargetDocuments;
};

export { CreateEffectActionNode };
