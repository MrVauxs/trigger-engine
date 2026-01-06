import { IconObject, zIconObj } from "_zod";
import { z, zString } from "module-helpers";

const zNodeHeaderBackground = z.union([
    z.number(),
    z.string().regex(/^#[0-9A-Fa-f]{6}$/) as zTypedString<`#${string}`>,
]);

const zNodeIconData = z.union([
    z.string().transform((value) => {
        return { unicode: value, fontMult: 1 } satisfies IconObject;
    }),
    zIconObj,
]);

const zNodeHeaderData = z.object({
    background: zNodeHeaderBackground.default("#000000").catch("#000000"),
    icon: zNodeIconData.nullish(),
    subtitle: z.string().nullish(),
    title: zString,
});

type NodeHeaderSource = z.input<typeof zNodeHeaderData>;

export { zNodeIconData, zNodeHeaderData };
export type { NodeHeaderSource };
