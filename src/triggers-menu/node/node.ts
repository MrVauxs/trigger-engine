import { TriggerNode } from "engine";
import { drawRectangleMask, R } from "module-helpers";
import { BlueprintNodesLayer } from ".";
import { Blueprint } from "..";

class BlueprintNode extends PIXI.Container {
    #calculatedheight: number = 0;
    #calculatedWith: number = 0;
    #border: PIXI.Graphics = new PIXI.Graphics();
    #hitArea: PIXI.Rectangle = new PIXI.Rectangle();
    #node: TriggerNode;
    #selected: boolean = false;

    static SELECTED_COLOR: ColorSource = 0xff9829;

    constructor(node: TriggerNode) {
        super();

        this.#node = node;

        // this.eventMode = "static";
        // this.on("pointerdown", this.#onPointerDown, this);
    }

    get blueprint(): Blueprint {
        return this.parent.blueprint;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get id(): string {
        return this.#node.id;
    }

    get fontSize(): number {
        return 15;
    }

    get outerPadding(): Point {
        return { x: 10, y: 4 };
    }

    get opacity(): number {
        return 0.6;
    }

    get backgroundColor(): ColorSource {
        return 0x000000;
    }

    get borderRadius(): number {
        return 10;
    }

    get borderOptions(): ILineStyleOptions {
        return {
            color: 0x000000,
            width: 1.5,
            alpha: 0.6,
        };
    }

    get selectedBorderOptions(): ILineStyleOptions {
        return {
            color: BlueprintNode.SELECTED_COLOR,
            width: 2,
            alpha: 0.6,
        };
    }

    get minWidth(): number {
        return 200;
    }

    get maxWidth(): number {
        return Infinity;
    }

    get minHeight(): number {
        return 50;
    }

    get canDrag(): boolean {
        return this.isLocked;
    }

    get isLocked(): boolean {
        // TODO
        return true;
    }

    get selected(): boolean {
        return this.#selected;
    }

    set selected(value) {
        if (this.selected === value) return;

        this.#selected = value;
        this.#drawBorder(value);
    }

    bringToTop() {
        const highest = R.firstBy(this.parent.children, [R.prop("zIndex"), "desc"])?.zIndex ?? 0;
        this.zIndex = highest + 1;
        this.parent.sortChildren();
    }

    draw() {
        const header = this.#drawHeader();
        const body = this.#drawBody();

        const width = Math.min(
            Math.max(header?.calculatedWith ?? 0, body.calculatedWith, this.minWidth),
            this.maxWidth
        );
        const height = body.calculatedHeight + (header?.calculatedHeight ?? 0);

        this.#calculatedWith = width;
        this.#calculatedheight = height;

        // background
        const background = new PIXI.Graphics();
        const backgroundMask = drawRectangleMask(0, 0, width, height, this.borderRadius);

        background.mask = backgroundMask;
        background.addChild(backgroundMask);

        this.addChild(background);

        // header
        if (header) {
            const color = new PIXI.Color(this.#node.header?.background ?? this.backgroundColor);

            background.beginFill(color, this.opacity);
            background.drawRect(0, 0, width, header.calculatedHeight);
            background.endFill();

            this.addChild(header);

            body.y = header.calculatedHeight;
        }

        // body
        background.beginFill(this.backgroundColor, this.opacity);
        background.drawRect(0, body.y, width, body.calculatedHeight);
        background.endFill();

        this.addChild(body);

        // border
        this.addChild(this.#drawBorder(false));

        // set position
        const { x, y } = this.#node._data.position;
        this.position.set(x, y);

        // set hit area
        this.#hitArea.width = width;
        this.#hitArea.height = height;
    }

    fontAwesomeIcon(icon: unknown, fontSize?: number): PreciseText | undefined {
        icon = R.isString(icon) ? { unicode: icon } : icon;
        if (!R.isPlainObject(icon) || !R.isString(icon?.unicode)) return;

        const fontWeight = (R.isString(icon.fontWeight) && icon.fontWeight) || "400";

        return this.preciseText(icon.unicode, {
            fontFamily: "Font Awesome 6 Pro",
            fontWeight: fontWeight as TextStyleFontWeight,
            fontSize,
        });
    }

    preciseText(text: unknown, options: Partial<PIXI.ITextStyle> = {}): PreciseText | undefined {
        if (!R.isString(text)) return;

        if (!R.isNumber(options.fontSize)) {
            delete options.fontSize;
        }

        const style = new PIXI.TextStyle(
            foundry.utils.mergeObject(
                {
                    fontFamily: "Signika",
                    fontSize: this.fontSize,
                    fontStyle: "normal",
                    fontWeight: "normal",
                    fill: "#ffffff",
                    stroke: "#111111",
                    strokeThickness: 0,
                    dropShadow: true,
                    dropShadowColor: "#000000",
                    dropShadowBlur: 2,
                    dropShadowAngle: 0,
                    dropShadowDistance: 0,
                    wordWrap: false,
                    wordWrapWidth: 100,
                    lineJoin: "miter",
                },
                options
            )
        );

        return new foundry.canvas.containers.PreciseText(text, style);
    }

    #drawBorder(selected: boolean): PIXI.Graphics {
        const border = this.#border;
        const width = this.#calculatedWith;
        const height = this.#calculatedheight;

        border.clear();
        border.lineStyle(selected ? this.selectedBorderOptions : this.borderOptions);
        border.drawRoundedRect(0, 0, width, height, this.borderRadius);

        return this.#border;
    }

    #drawBody(): NodePart {
        const body = new PIXI.Graphics() as NodePart;

        body.calculatedWith = 0;
        body.calculatedHeight = Math.max(0, this.minHeight);

        return body;
    }

    #drawHeader(): NodePart | undefined {
        const data = this.#node.header;
        const title = this.preciseText(data?.title);
        if (!data || !title) return;

        const spacing = 5;
        const padding = this.outerPadding;
        const header = new PIXI.Graphics() as NodePart;
        const icon = this.fontAwesomeIcon(data.icon);
        const subtitle = this.preciseText(data.subtitle, {
            fontSize: this.fontSize * 0.93,
            fontStyle: "italic",
            fill: "d9d9d9",
        });

        if (icon) {
            icon.x = padding.x;
            title.x = icon.x + icon.width + spacing;

            header.addChild(icon);
        } else {
            title.x = padding.x;
        }

        alignHorizontally(padding.y, icon, title);

        header.addChild(title);

        if (subtitle) {
            subtitle.x = title.x + (icon ? 0 : 2);
            subtitle.y = getBottom(title);

            header.addChild(subtitle);
        }

        title.getBounds();

        header.calculatedHeight = maxBottom(title, subtitle) + padding.y;
        header.calculatedWith = maxRight(title, subtitle) + padding.x;

        return header;
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        if (event.button === 2) {
            event.stopPropagation();
            this.#onContextMenu(event);
        }

        // event.stopPropagation();

        // if (event.button === 0) {
        //     this.#drag = {
        //         origin: this.blueprint.subtractPointFromEvent(event, this.parent.parent),
        //         shiftHeld: event.shiftKey,
        //     };
        //     // this.bringToTop();

        //     // if (event.shiftKey) {
        //     //     this.selected = !this.selected;
        //     // } else {
        //     //     this.parent.clearSelected();
        //     //     this.selected = true;
        //     // }

        //     // if (this.canDrag) {
        //     //     this.parent.onMoveSelectedStart(event);
        //     // }

        //     // this.stage.on("pointermove", this.#onPointerMove, this);
        //     // this.stage.on("pointerup", this.#onPointerUp, this);
        //     // this.stage.on("pointerupoutside", this.#onPointerUp, this);
        // } else if (event.button === 2 && !this.isLocked) {
        //     this.#onContextMenu(event);
        // }
    }

    #onPointerMove(event: PIXI.FederatedPointerEvent) {
        //         if (!dragging) {
        //     const target = this.subtractPointFromEvent(event, this.#layers.position);
        //     const distance = distanceToPoint(target, origin);
        //     if (distance < 10) return;
        //     this.#drag.dragging = true;
        //     this.#layers.interactiveChildren = false;
        //     if (!selection) {
        //         this.stage.cursor = "grabbing";
        //     }
        // }
    }

    #onPointerUp(event: PIXI.FederatedPointerEvent) {}

    async #onContextMenu(event: PIXI.FederatedPointerEvent) {}
}

interface BlueprintNode {
    readonly parent: BlueprintNodesLayer;
}

function alignHorizontally(offset: number, ...elements: (PIXI.Container | undefined)[]) {
    const maxHeight = Math.max(...elements.map((el) => el?.height ?? 0));

    for (const el of elements) {
        if (!el) continue;
        el.y = (maxHeight - el.height) / 2 + offset;
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

type ILineStyleOptions = Parameters<PIXI.Graphics["lineTextureStyle"]>[0];

type NodePart = PIXI.Graphics & {
    calculatedHeight: number;
    calculatedWith: number;
};

export { BlueprintNode };
