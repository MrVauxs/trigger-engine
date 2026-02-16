import { TriggerNode } from "engine";
import { CustomConditionOptions } from "foundry-helpers";
import { DoubleImgInputs, doubleImgSchemas, getDoubleImgValue, PF2eInputEntry } from "pf2e";
import { DurationInputs, durationSchemas, DurationState, getDurationData } from ".";

function effectSchemas(group?: string): PF2eInputEntry[] {
    return [
        { key: "name", type: "text", group },
        ...doubleImgSchemas(),
        { key: "slug", type: "text", group },
        { key: "secret", type: "boolean", group, label: "PF2E.EffectPanel.Unidentified" },
        ...durationSchemas(),
    ];
}

async function getEffectData(
    this: TriggerNode<any, EffectInputs, any, any, any, DurationState>,
): Promise<EffectOptions> {
    const img = await getDoubleImgValue.call(this);
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

type EffectInputs = DurationInputs &
    DoubleImgInputs & {
        name: string;
        secret: boolean;
        slug: string;
    };

export { effectSchemas, getEffectData };
export type { EffectInputs };
