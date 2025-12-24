import { IconObject, zIconObj } from "_zod";
import { z, zString } from "module-helpers";

const zNodeHeaderBackground = z.union([
    z.number(),
    z.string().regex(/^#[0-9A-F]{6}$/) as zTypedString<`#${string}`>,
]);

const zNodeIconData = z.union([
    z.string().transform((value) => {
        return { unicode: value, fontMult: 1 } satisfies IconObject;
    }),
    zIconObj,
]);

const zNodeHeaderData = z.object({
    background: zNodeHeaderBackground.nullish().catch("#000000"),
    icon: zNodeIconData.nullish().catch(undefined),
    subtitle: z.string().nullish().catch(undefined),
    title: zString,
});

type NodeHeaderSource = z.input<typeof zNodeHeaderData>;

export { zNodeHeaderData };
export type { NodeHeaderSource };
