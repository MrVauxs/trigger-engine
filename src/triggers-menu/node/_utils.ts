import { localize, R, waitDialog } from "module-helpers";
import { BlueprintNode } from ".";

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

async function editNodeDialog(node?: BlueprintNode): Promise<string | undefined> {
    const label = node?.data.custom.title || "";

    const group = foundry.applications.fields.createFormGroup({
        label: localize("edit-gate.label"),
        input: foundry.applications.fields.createTextInput({
            name: "label",
            autofocus: true,
            placeholder: label,
            value: label,
        }),
    });

    const result = await waitDialog<{ label: string }>({
        content: group.outerHTML,
        i18n: "edit-gate",
        title: localize("edit-gate.title", node ? "edit" : "create"),
        yes: {
            label: localize("edit-gate.yes", node ? "edit" : "create"),
        },
    });

    return result && result.label && (!node || label !== result.label) ? result.label : undefined;
}

async function editNode(node: BlueprintNode) {
    const label = await editNodeDialog(node);
    if (!label) return;

    node.data.update({
        custom: {
            title: label,
        },
    });

    node.refresh({ renderApplication: true });
}

type NodePart<T extends PIXI.DisplayObject = PIXI.DisplayObject> = PIXI.Container<T> & {
    calculatedHeight: number;
    calculatedWith: number;
};

export { alignHorizontally, editNode, editNodeDialog, getBottom, getRight, maxBottom, maxRight };
export type { NodePart };
