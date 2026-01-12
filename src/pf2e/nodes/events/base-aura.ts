import { BaseEventNode } from "engine";
import { R, actorsRespectAlliance, isCurrentCombatant, localizePath } from "module-helpers";
import { AuraEventOptions, PF2eInputEntry, PF2eOutputEntry } from "pf2e";

abstract class BaseAuraEvent extends BaseEventNode<Inputs, Outputs> {
    static get tags(): string[] {
        return ["aura"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            {
                key: "slug",
                type: "text",
                label: this.localizePath("inputs.slug.title"),
            },
            {
                key: "affects",
                type: "text",
                label: this.localizePath("inputs.affects.title"),
                field: {
                    type: "select",
                    default: "enemies",
                    options: R.map(["all", "allies", "enemies"], (value) => {
                        return {
                            value,
                            label: this.localizePath("inputs.affects.options", value),
                        };
                    }),
                },
            },
            {
                key: "when",
                type: "text",
                label: this.localizePath("inputs.when.title"),
                field: {
                    type: "select",
                    default: "turn",
                    options: R.map(["always", "combat", "turn"], (value) => {
                        return {
                            value,
                            label: this.localizePath("inputs.when.options", value),
                        };
                    }),
                },
            },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [
            {
                key: "target",
                type: "target",
            },
            {
                key: "source",
                type: "target",
                label: this.localizePath("outputs.source.title"),
            },
        ];
    }

    static localizePath(...path: string[]): string {
        return localizePath(`pf2e-trigger.node.event.base-aura-event`, ...path);
    }

    async _execute({ aura, target }: AuraEventOptions): Promise<boolean> {
        const actor = target.actor;
        if (aura.origin.actor.uuid === actor.uuid || aura.data.slug !== (await this.getInputValue("slug")))
            return false;

        const when = await this.getInputValue("when");
        if ((when === "combat" && !actor.combatant) || (when === "turn" && !isCurrentCombatant(actor))) return false;

        const affects = await this.getInputValue("affects");
        if (!actorsRespectAlliance(aura.origin.actor, actor, affects)) return false;

        this.setOutputValue("source", aura.origin);
        this.setOutputValue("target", target);

        return this.executeNext("out");
    }
}

type Inputs = {
    slug: string;
    affects: "all" | "allies" | "enemies";
    when: "always" | "combat" | "turn";
};

type Outputs = {
    source: TargetDocuments;
    target: TargetDocuments;
};

export { BaseAuraEvent };
