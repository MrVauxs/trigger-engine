import { BaseConditionNode } from "engine";
import { actorsRespectAlliance } from "foundry-helpers";
import { BaseAuraEvent, PF2eInputEntry, PF2eOutputEntry, getAurasInMemory } from "pf2e";

class InsideAuraConditionNode extends BaseConditionNode<Inputs, Outputs> {
    static get type(): "inside-aura" {
        return "inside-aura";
    }

    static get tags(): string[] {
        return ["aura", "loop"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [
            { key: "target", type: "target" },
            ...BaseAuraEvent.defineInputs.slice(0, 2),
            { key: "once", type: "boolean" },
        ];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [BaseAuraEvent.defineOutputs[1]];
    }

    get isLoop(): boolean {
        return !this.getLocalValue("once");
    }

    async _execute(): Promise<boolean> {
        const target = await this.getInputValue("target");
        const slug = await this.getInputValue("slug");

        if (!target || !slug) {
            return this.executeNext("false");
        }

        const once = await this.getInputValue("once");
        const affects = await this.getInputValue("affects");
        const auras = getAurasInMemory(target.actor).filter(({ data, origin }) => {
            return data.slug === slug && actorsRespectAlliance(origin.actor, target.actor, affects);
        });

        if (!auras.length) {
            return this.executeNext("false");
        }

        for (const { origin } of auras) {
            this.setOutputValue("source", origin);

            const keepExecuting = await this.executeNext("true");
            if (once || !keepExecuting) break;
        }

        return true;
    }
}

type Inputs = {
    affects: "all" | "allies" | "enemies";
    once: boolean;
    slug: string;
    target?: TargetDocuments;
};

type Outputs = {
    source?: TargetDocuments;
};

export { InsideAuraConditionNode };
