import { IconObject } from "_zod";

const gmOnlySpecialIcon: SpecialIcon = {
    icon: {
        fontMult: 0.94,
        fontWeight: "800",
        unicode: "\uf521",
    },
    name: "gm-only",
};

type SpecialIcon = { icon: IconObject; name: string };

export { gmOnlySpecialIcon };
export type { SpecialIcon };
