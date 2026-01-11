import { IconObject, zIconObj } from "_zod";
import { z, zString } from "module-helpers";

const zNodeHeaderBackground = z
    .union([z.number(), z.string().regex(/^#[0-9A-Fa-f]{6}$/) as zTypedString<`#${string}`>])
    .default("#000000")
    .catch("#000000");

const zNodeIconData = z.union([
    z.string().transform((value) => {
        return { unicode: value, fontMult: 1, fontWeight: "400" } satisfies IconObject;
    }),
    zIconObj,
]);

const zNodeHeaderData = z.object({
    background: zNodeHeaderBackground,
    icon: zNodeIconData.nullish(),
    subtitle: z.string().nullish(),
    title: zString,
});

type NodeHeaderSource = z.input<typeof zNodeHeaderData>;

export { zNodeHeaderBackground, zNodeHeaderData, zNodeIconData };
export type { NodeHeaderSource };
