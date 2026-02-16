import { z } from "foundry-helpers";

function zForceSafeParse<T extends z.ZodType>(zod: Maybe<T>, data: z.input<T>): z.output<T> {
    return zod?.safeParse(data)?.data ?? zod?.safeParse({})?.data ?? ({} as z.output<T>);
}

export { zForceSafeParse };
