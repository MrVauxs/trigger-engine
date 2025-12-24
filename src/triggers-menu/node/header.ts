import { IconObject, zIconObj } from "_zod";
import { z, zString } from "module-helpers";

function zNodeHeaderBackground() {
    return z.union([z.number(), z.string().regex(/^#[0-9A-F]{6}$/) as zTypedString<`#${string}`>]);
}

function zNodeIconData() {
    return z.union([
        z.string().transform((value) => {
            return { unicode: value, fontMult: 1 } satisfies IconObject;
        }),
        zIconObj(),
    ]);
}

function zNodeHeaderData() {
    return z.object({
        background: zNodeHeaderBackground().nullish().catch("#000000"),
        icon: zNodeIconData().nullish().catch(undefined),
        subtitle: z.string().nullish().catch(undefined),
        title: zString(),
    });
}

type NodeHeaderSource = z.input<ReturnType<typeof zNodeHeaderData>>;

export { zNodeHeaderData };
export type { NodeHeaderSource };
