import { BaseAuraEvent, PF2eInputEntry, PF2eOutputEntry, getAurasInMemory } from "pf2e";
import { BaseConditionNode } from ".";
import { actorsRespectAlliance } from "module-helpers";

class InsideAuraConditionNode extends BaseConditionNode<Inputs, { source: TargetDocuments }> {
    static get type(): "inside-aura" {
        return "inside-aura";
    }

    static get tags(): string[] {
        return ["aura"];
    }

    static get defineInputs(): PF2eInputEntry[] {
        return [{ key: "target", type: "target" }, ...BaseAuraEvent.defineInputs.slice(0, 2)];
    }

    static get defineOutputs(): PF2eOutputEntry[] {
        return [BaseAuraEvent.defineOutputs[1]];
    }

    get isLoop(): boolean {
        return true;
    }

    async _execute(): Promise<boolean> {
        const target = (await this.getInputValue("target"))?.actor;
        const slug = await this.getInputValue("slug");

        if (!target || !slug) {
            return this.executeNext("false");
        }

        const affects = await this.getInputValue("affects");
        const auras = getAurasInMemory(target).filter(({ data, origin }) => {
            return data.slug === slug && actorsRespectAlliance(origin.actor, target, affects);
        });

        if (!auras.length) {
            return this.executeNext("false");
        }

        for (const { origin } of auras) {
            this.setOutputValue("source", origin);

            const keepExecuting = await this.executeNext("true");
            if (!keepExecuting) break;
        }

        return true;
    }
}

type Inputs = {
    affects: "all" | "allies" | "enemies";
    slug: string;
    target?: TargetDocuments;
};

export { InsideAuraConditionNode };
