import { TriggerNode } from "engine";
import { PF2eInputEntry } from "pf2e";
import { DurationInputs, DurationState, durationSchemas, getDurationData } from ".";
import { CustomConditionOptions } from "module-helpers";

let EFFECT_SCHEMAS: PF2eInputEntry[] | undefined;

function effectSchemas(): PF2eInputEntry[] {
    return (EFFECT_SCHEMAS ??= [
        { key: "name", type: "text", group: "effect" },
        { key: "img", type: "text", group: "effect" },
        { key: "slug", type: "text", group: "effect" },
        { key: "secret", type: "boolean", group: "effect", label: "PF2E.EffectPanel.Unidentified" },
        ...durationSchemas(),
    ]);
}

async function getEffectData(
    this: TriggerNode<any, EffectInputs, any, any, any, DurationState>,
): Promise<EffectOptions> {
    const img = await this.getInputValue("img");
    const slug = await this.getInputValue("slug");

    return {
        duration: await getDurationData.call(this),
        img: foundry.helpers.media.ImageHelper.hasImageExtension(img) ? img : undefined,
        itemSlug: game.pf2e.system.sluggify(slug),
        name: await this.getInputValue("name"),
        unidentified: await this.getInputValue("secret"),
    };
}

type EffectOptions = Omit<CustomConditionOptions, "slug" | "counter" | "alterations">;

type EffectInputs = DurationInputs & {
    img: string;
    name: string;
    secret: boolean;
    slug: string;
};

export { effectSchemas, getEffectData };
export type { EffectInputs };
