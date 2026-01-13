import { zIconObj } from "_zod";
import { z, zString } from "module-helpers";

const zNodeHeaderBackground = z.custom<ColorSource>((value): boolean => {
    try {
        new PIXI.Color(value as any);
        return true;
    } catch (error: any) {
        return false;
    }
});

const zNodeIconData = z.union([z.string(), zIconObj]);

const zNodeHeaderData = z.object({
    background: zNodeHeaderBackground.default("#000000").catch("#000000"),
    icon: zNodeIconData.nullish(),
    subtitle: z.string().nullish(),
    title: zString,
});

type NodeHeaderSource = z.input<typeof zNodeHeaderData>;

export { zNodeHeaderBackground, zNodeHeaderData, zNodeIconData };
export type { NodeHeaderSource };
