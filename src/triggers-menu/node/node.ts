import { IconObject, NodeData, NodeHeader, TriggerNode } from "engine";
import {
    drawRectangleMask,
    LocalizeArgs,
    mapToObjByKey,
    MouseInteractionManager,
    R,
} from "module-helpers";
import {
    alignHorizontally,
    BaseBlueprintEntry,
    BlueprintBridgeEntry,
    BlueprintEntry,
    BlueprintNodesLayer,
    BlurprintInputEntry,
    getBottom,
    getRight,
    maxBottom,
    maxRight,
    NodePart,
} from ".";
import { Blueprint } from "..";

class BlueprintNode extends PIXI.Container {
    #border: PIXI.Graphics = new PIXI.Graphics();
    #calculatedheight: number = 0;
    #calculatedWith: number = 0;
    #data?: NodeData;
    #hitArea: PIXI.Rectangle = new PIXI.Rectangle();
    #in: BlueprintBridgeEntry | undefined;
    #initialized: boolean = false;
    #inputs: Collection<BlurprintInputEntry> = new Collection();
    #mouseManager?: MouseInteractionManager;
    #node: TriggerNode;
    #outputs: Collection<BlueprintEntry> = new Collection();
    #outs: Collection<BlueprintBridgeEntry> = new Collection();
    #selected: boolean = false;

    static SELECTED_COLOR: ColorSource = 0xff9829;

    constructor(node: TriggerNode) {
        super();

        this.#node = node;
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

    get data(): NodeData {
        return (this.#data ??= this.blueprint.trigger?.getNodeData(this.id)!);
    }

    get fontSize(): number {
        return 15;
    }

    get entryHeight(): number {
        return this.fontSize * 1.5;
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

    initialize() {
        if (this.#initialized || this.blueprint.locked) return;

        this.#initialized = true;

        const handlers: ConstructorParameters<typeof MouseInteractionManager>[3] = {
            clickLeft: this._onClickLeft.bind(this),
            clickRight: this._onClickRight.bind(this),
            unclickLeft: this._onUnclickLeft.bind(this),
            unclickRight: this._onUnclickRight.bind(this),
            dragLeftStart: this._onDragLeftStart.bind(this),
            dragLeftMove: this._onDragLeftMove.bind(this),
            dragLeftDrop: this._onDragLeftDrop.bind(this),
            dragRightStart: this._onDragRightStart.bind(this),
            dragRightMove: this._onDragRightMove.bind(this),
            dragRightDrop: this._onDragRightDrop.bind(this),
        };

        const permissions: ConstructorParameters<typeof MouseInteractionManager>[2] = {};

        this.#mouseManager = new foundry.canvas.interaction.MouseInteractionManager(
            this,
            this.stage,
            permissions,
            handlers,
            { application: this.blueprint }
        );

        this.#mouseManager.activate();
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
            background.beginFill(header.background, this.opacity);
            background.drawRect(0, 0, width, header.calculatedHeight);
            background.endFill();

            this.addChild(header);

            body.y = header.calculatedHeight;
        }

        // body

        const targetWidth = width - this.outerPadding.x * 2;
        for (const row of body.children as NodePart[]) {
            const output = row.children.at(-1) as NodePart;

            // x is not 0 so it is indeed an output
            if (output.x !== 0) {
                output.x = targetWidth - output.width;
            }
        }

        background.beginFill(this.backgroundColor, this.opacity);
        background.drawRect(0, body.y, width, body.calculatedHeight);
        background.endFill();

        this.addChild(body);

        // border
        this.addChild(this.#drawBorder(false));

        // set position
        const { x, y } = this.data.position;
        this.position.set(x, y);

        // set hit area
        this.#hitArea.width = width;
        this.#hitArea.height = height;
    }

    localize(...args: LocalizeArgs): string | undefined {
        return this.#node.localize(...args);
    }

    selectOnly() {
        this.bringToTop();
        this.parent.clearSelected();
        this.selected = true;
    }

    cancelMouse() {
        this.#mouseManager?.cancel();
    }

    _onClickLeft(event: FederatedEvent) {
        this.blueprint.cancelMouse();

        if (event.shiftKey) {
            this.selected = !this.selected;
        } else if (!this.selected) {
            this.selectOnly();
        }
    }

    _onClickRight(event: FederatedEvent) {
        this.blueprint.cancelMouse();
    }

    _onUnclickLeft(event: FederatedEvent) {
        this.blueprint.cancelMouse();

        if (!event.shiftKey) {
            this.selectOnly();
        }
    }

    _onUnclickRight(event: FederatedEvent) {
        this.blueprint.cancelMouse();

        this.bringToTop();
        this.#onContextMenu(event);
    }

    _onDragLeftStart(event: FederatedEvent) {
        this.blueprint.cancelMouse();
        if (event.shiftKey) return;

        const selected = this.parent.selected;

        const interactionData = event.interactionData as InteractionData;

        interactionData.selected = R.map(selected.length ? selected : [this], (node) => {
            return { node, origin: this.blueprint.subtractPointFromEvent(event, node) };
        });

        mapToObjByKey(selected.length ? selected : [this], "id");
    }

    _onDragLeftMove(event: FederatedEvent) {
        this.blueprint.cancelMouse();

        const { selected } = event.interactionData as InteractionData;
        if (!selected?.length) return;

        for (const { node, origin } of selected) {
            const { x, y } = this.blueprint.subtractPointFromEvent(event, origin);
            node.position.set(x, y);
        }
    }

    _onDragLeftDrop(event: FederatedEvent) {
        this.blueprint.cancelMouse();

        const { selected } = event.interactionData as InteractionData;
        if (!selected) return;

        for (const { node } of selected) {
            const { x, y } = node.position;

            node.data.updateSource({
                position: { x, y },
            });
        }
    }

    _onDragRightStart(event: FederatedEvent) {
        this.blueprint._onDragRightStart(event);
    }

    _onDragRightMove(event: FederatedEvent) {
        this.blueprint._onDragRightMove(event);
    }

    _onDragRightDrop(event: FederatedEvent) {
        this.blueprint.cancelMouse();
    }

    fontAwesomeIcon(icon: IconObject): PreciseText;
    fontAwesomeIcon(icon: Maybe<IconObject>): PreciseText | undefined;
    fontAwesomeIcon(icon: Maybe<IconObject>) {
        if (!icon) return;

        const fontSize = R.isNumber(icon.fontSize) ? icon.fontSize : undefined;
        const fontWeight = (R.isString(icon.fontWeight) && icon.fontWeight) || "400";

        return this.preciseText(icon.unicode, {
            fontFamily: "Font Awesome 6 Pro",
            fontWeight: fontWeight as TextStyleFontWeight,
            fontSize,
        });
    }

    preciseText(text: string, options?: Partial<PIXI.ITextStyle>): PreciseText;
    preciseText(text: Maybe<string>, options?: Partial<PIXI.ITextStyle>): PreciseText | undefined;
    preciseText(text: Maybe<string>, options: Partial<PIXI.ITextStyle> = {}) {
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
        const body = new PIXI.Container() as NodePart;
        const _entries = this.#node._entries;
        const outs = _entries.outs.contents;
        const inputs = _entries.inputs.contents;
        const outputs = _entries.outputs.contents;
        const minEntryIndex = _entries.in || outs.length ? 1 : 0;

        const nbRows = Math.max(
            inputs.length + (_entries.in ? 1 : 0),
            outs.length + outputs.length
        );

        const spacing = 20;
        const padding = this.outerPadding;

        const rows: NodePart[] = R.times(nbRows, () => new PIXI.Container() as NodePart);

        const addToRow = (index: number, el: BaseBlueprintEntry) => {
            const row = rows[index];

            el.draw();
            row.addChild(el);

            if (el.isInput) {
                row.calculatedWith = getRight(el) + spacing;
            } else {
                el.x = row.calculatedWith || spacing;
                row.calculatedWith = getRight(el);
            }
        };

        // we process all inputs first to make layout computation easier

        if (_entries.in) {
            this.#in = new BlueprintBridgeEntry(this, "inputs", _entries.in);
            addToRow(0, this.#in);
        }

        const firstInputIndex = minEntryIndex;
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const entry = new BlurprintInputEntry(this, input);

            this.#inputs.set(entry.key, entry);
            addToRow(i + firstInputIndex, entry);
        }

        // we process all outputs after that

        for (let i = 0; i < outs.length; i++) {
            const out = outs[i];
            const entry = new BlueprintBridgeEntry(this, "outputs", out);

            this.#outs.set(entry.key, entry);
            addToRow(i, entry);
        }

        const firstoutputIndex = Math.max(outs.length, minEntryIndex);
        for (let i = 0; i < outputs.length; i++) {
            const output = outputs[i];
            const entry = new BlueprintEntry(this, "outputs", output);

            this.#outputs.set(entry.key, entry);
            addToRow(i + firstoutputIndex, entry);
        }

        // return

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            row.x = padding.x;
            row.y = padding.y + i * this.entryHeight;

            body.addChild(row);
        }

        body.calculatedWith = padding.x * 2 + Math.max(...rows.map((row) => row.calculatedWith));
        body.calculatedHeight = nbRows * this.entryHeight + padding.y * 2;

        return body;
    }

    #drawHeader(): NodeheaderPart | undefined {
        const data = this.#node.header && new NodeHeader(this.#node.header);
        if (!data || data.invalid) return;

        const padding = this.outerPadding;
        const header = new PIXI.Container() as NodeheaderPart;
        const icon = this.fontAwesomeIcon(data.icon);
        const title = this.preciseText(data.title);
        const subtitle = this.preciseText(data.subtitle, {
            fontSize: this.fontSize * 0.93,
            fontStyle: "italic",
            fill: "d9d9d9",
        });

        alignHorizontally(header, [icon, title], { offset: padding, spacing: 5 });

        if (subtitle) {
            subtitle.x = title.x + (icon ? 0 : 2);
            subtitle.y = getBottom(title);

            header.addChild(subtitle);
        }

        title.getBounds();

        header.background = new PIXI.Color(data.background ?? this.backgroundColor);
        header.calculatedHeight = maxBottom(title, subtitle) + padding.y;
        header.calculatedWith = maxRight(title, subtitle) + padding.x;

        return header;
    }

    async #onContextMenu(event: PIXI.FederatedPointerEvent) {}
}

interface BlueprintNode {
    readonly parent: BlueprintNodesLayer;
}

type ILineStyleOptions = Parameters<PIXI.Graphics["lineTextureStyle"]>[0];

type NodeheaderPart = NodePart & {
    background: PIXI.ColorSource;
};

type FederatedEvent = PIXI.FederatedPointerEvent & {
    interactionData: Record<string, any>;
};

type InteractionData = {
    selected?: { node: BlueprintNode; origin: Point }[];
};

export { BlueprintNode };
