import { z } from "module-helpers";

function zIconObj() {
    return z.object({
        fontWeight: z.optional(z.string<TextStyleFontWeight>()),
        fontMult: z.number().min(0).default(1),
        unicode: z.string().trim().min(5),
    });
}

type IconObject = z.input<ReturnType<typeof zIconObj>>;

export { zIconObj };
export type { IconObject };
