import { localize, R, waitDialog } from "module-helpers";

function alignHorizontally(
    parent: PIXI.Container,
    elements: MaybeFalsy<PIXI.Container>[],
    {
        height,
        offset: { x = 0, y = 0 } = {},
        reverse = false,
        spacing = 0,
    }: { height?: number; offset?: Partial<Point>; reverse?: boolean; spacing?: number } = {},
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

async function editLabelDialog(
    type: "gate" | "variable",
    { placeholder, value }: { placeholder?: string; value?: string } = {},
): Promise<string | undefined | null> {
    const group = foundry.applications.fields.createFormGroup({
        label: localize("edit-label.label"),
        input: foundry.applications.fields.createTextInput({
            name: "label",
            autofocus: true,
            placeholder: placeholder || value,
            value: value,
        }),
    });

    const result = await waitDialog<{ label: string }>({
        content: group.outerHTML,
        i18n: "edit-label",
        title: localize("edit-label.title", type, value ? "edit" : "create"),
        yes: {
            label: localize("edit-label.yes", value ? "edit" : "create"),
        },
    });

    if (!result) return null;
    return result && result.label && (!value || value !== result.label) ? result.label : undefined;
}

type NodePart<T extends PIXI.DisplayObject = PIXI.DisplayObject> = PIXI.Container<T> & {
    calculatedHeight: number;
    calculatedWith: number;
};

export { alignHorizontally, editLabelDialog, getBottom, getRight, maxBottom, maxRight };
export type { NodePart };
