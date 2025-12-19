import { R } from "module-helpers";

function alignHorizontally(
    parent: PIXI.Container,
    elements: MaybeFalsy<PIXI.Container>[],
    {
        height,
        offset: { x = 0, y = 0 } = {},
        reverse = false,
        spacing = 0,
    }: { height?: number; offset?: Partial<Point>; reverse?: boolean; spacing?: number } = {}
) {
    const filtered = R.filter(elements, R.isTruthy);
    const entries = reverse ? R.reverse(filtered) : filtered;

    const maxHeight = height || Math.max(...entries.map((el) => el.height));

    for (const entry of entries) {
        entry.x = x;
        entry.y = (maxHeight - entry.height) / 2 + y;

        x += entry.width + spacing;

        parent.addChild(entry);
    }
}

function getRight(el?: PIXI.Container | NodePart): number {
    if (!el) return 0;
    return el.x + el.width;
}

function getBottom(el?: PIXI.Container | NodePart): number {
    if (!el) return 0;
    return el.y + el.height;
}

function maxRight(a?: PIXI.Container | NodePart, b?: PIXI.Container | NodePart): number {
    return Math.max(getRight(a), getRight(b));
}

function maxBottom(a?: PIXI.Container | NodePart, b?: PIXI.Container | NodePart): number {
    return Math.max(getBottom(a), getBottom(b));
}

type NodePart<T extends PIXI.DisplayObject = PIXI.DisplayObject> = PIXI.Container<T> & {
    calculatedHeight: number;
    calculatedWith: number;
};

export { alignHorizontally, getBottom, getRight, maxBottom, maxRight };
export type { NodePart };
