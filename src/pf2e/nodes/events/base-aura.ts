import { BaseEventNode } from "engine";
import { R, actorsRespectAlliance, isCurrentCombatant, localize } from "foundry-helpers";
import { AuraEventOptions, PF2eInputEntry, PF2eOutputEntry } from "pf2e";

abstract class BaseAuraEvent extends BaseEventNode<Inputs, Outputs> {
    static get type(): string {
        return "base-aura-event";
    }

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
            {
                key: "self",
                type: "boolean",
                label: localize.path("pf2e-trigger.shared.aura.origin.title"),
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
        return localize.path("pf2e-trigger.node", this.category, "base-aura-event", ...path);
    }

    async _execute({ aura, target }: AuraEventOptions): Promise<boolean> {
        const slug = await this.getInputValue("slug");
        if (aura.data.slug !== slug) return false;

        const actor = target.actor;
        const self = await this.getInputValue("self");
        const isOrigin = aura.origin.actor.uuid === actor.uuid;
        if (!self && isOrigin) return false;

        const when = await this.getInputValue("when");
        if ((when === "combat" && !actor.combatant) || (when === "turn" && !isCurrentCombatant(actor))) return false;

        if (!isOrigin) {
            const affects = await this.getInputValue("affects");
            if (!actorsRespectAlliance(aura.origin.actor, actor, affects)) return false;
        }

        this.sceneContext = target.token;
        this.setOutputValue("source", aura.origin);
        this.setOutputValue("target", target);

        return this.executeNext("out");
    }
}

type Inputs = {
    affects: "all" | "allies" | "enemies";
    self: boolean;
    slug: string;
    when: "always" | "combat" | "turn";
};

type Outputs = {
    source: TargetDocuments;
    target: TargetDocuments;
};

export { BaseAuraEvent };
