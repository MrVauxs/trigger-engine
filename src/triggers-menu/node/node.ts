import {
    ConnectionId,
    IconObject,
    isConnectionId,
    isOppositeConnection,
    NodeData,
    NodeHeader,
    NodeHeaderData,
    OpenTrigger,
    OpenTriggerNode,
    TriggerNode,
} from "engine";
import {
    confirmDialog,
    createHTMLElement,
    drawRectangleMask,
    LocalizeArgs,
    localizePath,
    mapToObjByKey,
    MouseInteractionManager,
    R,
    subtractPoint,
} from "module-helpers";
import {
    alignHorizontally,
    BaseBlueprintEntry,
    BlueprintBridgeEntry,
    BlueprintEntry,
    BlueprintNodesLayer,
    EntryId,
    getBottom,
    getRight,
    maxBottom,
    maxRight,
    NodePart,
    PreciseEntryCategory,
} from ".";
import { Blueprint } from "..";

class BlueprintNode extends PIXI.Container {
    #border?: PIXI.Graphics;
    #calculatedheight: number = 0;
    #calculatedWith: number = 0;
    #entries: BaseBlueprintEntry[] = [];
    #hitArea: PIXI.Rectangle = new PIXI.Rectangle();
    #in: BlueprintBridgeEntry | undefined;
    #initialized: boolean = false;
    #inputs: Collection<BlueprintEntry> = new Collection();
    #mouseManager?: MouseInteractionManager;
    #node: OpenTriggerNode;
    #outputs: Collection<BlueprintEntry> = new Collection();
    #outs: Collection<BlueprintBridgeEntry> = new Collection();
    #selected: boolean = false;

    static SELECTED_COLOR: ColorSource = 0xff9829;

    constructor(node: OpenTriggerNode) {
        super();

        this.#node = node;
    }

    get ins(): Collection<BaseBlueprintEntry> {
        return new Collection(this.#in ? [["in", this.#in]] : undefined);
    }

    get outs(): Collection<BaseBlueprintEntry> {
        return this.#outs;
    }

    get inputs(): Collection<BaseBlueprintEntry> {
        return this.#inputs;
    }

    get outputs(): Collection<BaseBlueprintEntry> {
        return this.#outputs;
    }

    get blueprint(): Blueprint {
        return this.parent.blueprint;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get trigger(): OpenTrigger {
        return this.#node.parent;
    }

    get id(): string {
        return this.#node.id;
    }

    get data(): NodeData {
        return this.#node.data;
    }

    get isEvent(): boolean {
        return this.#node.isEvent;
    }

    get inputsHaveConnector(): boolean {
        return (this.#node.constructor as typeof TriggerNode).inputsHaveConnector;
    }

    get fontSize(): number {
        return 15;
    }

    get entryHeight(): number {
        return this.fontSize * 1.5;
    }

    get rowSpacing(): number {
        return 2;
    }

    get outerPadding(): Point {
        return { x: 6, y: 4 };
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
            width: 1,
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

    get width(): number {
        return this.#calculatedWith || super.width;
    }

    get height(): number {
        return this.#calculatedheight || super.height;
    }

    get isLocked(): boolean {
        return this.blueprint.locked;
    }

    get selected(): boolean {
        return this.#selected;
    }

    set selected(value) {
        if (this.selected === value) return;

        this.#selected = value;
        this.#drawBorder();
    }

    get entries(): BaseBlueprintEntry[] {
        return this.#entries;
    }

    initialize() {
        if (this.#initialized) return;

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

        const permissions: ConstructorParameters<typeof MouseInteractionManager>[2] = R.fromKeys(
            ["dragLeftStart", "dragLeftMove", "dragLeftDrop"] as const,
            () => {
                return !this.isLocked;
            }
        );

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

    clear() {
        this.#in = undefined;
        this.#entries = [];
        this.#outs.clear();
        this.#inputs.clear();
        this.#outputs.clear();

        const removed = this.removeChildren();

        for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy(true);
        }
    }

    draw() {
        this.clear();

        const header = this.#createHeader();
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
        this.addChild((this.#border = new PIXI.Graphics()));
        this.#drawBorder();

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

    setPosition(x: number, y: number) {
        this.position.set(x, y);
        this.data.updateSource({ position: { x, y } });

        for (const entry of this.entries) {
            this.blueprint.connections.refreshConnection(entry);
        }
    }

    getEntryConnections(category: PreciseEntryCategory, key: string): ConnectionId[] {
        return (
            (isOppositeConnection(category) && this.data[category][key]?.connections?.slice()) || []
        );
    }

    addConnection(category: PreciseEntryCategory, key: string, targetId: EntryId) {
        if (!isConnectionId(targetId)) return;

        const connections = this.getEntryConnections(category, key);
        if (connections.includes(targetId)) return;

        connections.push(targetId);

        this.data.updateSource({
            [category]: {
                [key]: {
                    connections,
                    value: undefined,
                },
            },
        });
    }

    removeConnection(category: PreciseEntryCategory, key: string, targetId: EntryId) {
        if (!isConnectionId(targetId)) return;

        const connections = this.getEntryConnections(category, key);
        const exist = connections.findSplice((id) => id === targetId);
        if (!exist) return;

        if (connections.length) {
            this.data.updateSource({
                [category]: {
                    [key]: {
                        connections,
                        "-=value": null,
                    },
                },
            });
        } else {
            this.data.updateSource({
                [category]: {
                    [`-=${key}`]: null,
                },
            });
        }
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

        if (!this.selected) {
            this.selectOnly();
        }

        this.#onNodeContextMenu(event);
    }

    _onDragLeftStart(event: FederatedEvent) {
        this.blueprint.cancelMouse();
        if (event.shiftKey) return;

        this.parent.interactiveChildren = false;

        const selected = this.parent.selected;
        const interactionData = event.interactionData as InteractionData;
        // we offset the distance buffer of the drag
        const offset = this.blueprint.subtractPointFromEvent(event, interactionData.origin);

        interactionData.selected = R.map(selected.length ? selected : [this], (node) => {
            return {
                node,
                origin: subtractPoint(this.blueprint.subtractPointFromEvent(event, node), offset),
            };
        });

        mapToObjByKey(selected.length ? selected : [this], "id");
    }

    _onDragLeftMove(event: FederatedEvent) {
        this.blueprint.cancelMouse();

        const { selected } = event.interactionData as InteractionData;
        if (!selected?.length) return;

        for (const { node, origin } of selected) {
            const { x, y } = this.blueprint.subtractPointFromEvent(event, origin);
            node.setPosition(x, y);
        }
    }

    _onDragLeftDrop(event: FederatedEvent) {
        this.blueprint.cancelMouse();
        this.parent.interactiveChildren = true;
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

        return this.preciseText(icon.unicode, {
            fontFamily: "Font Awesome 6 Pro",
            fontWeight: icon.fontWeight || "400",
            fontMult: icon.fontMult || 1,
        });
    }

    preciseText(text: string, options?: PreciseTextOptions): PreciseText;
    preciseText(text: Maybe<string>, options?: PreciseTextOptions): PreciseText | undefined;
    preciseText(text: Maybe<string>, options: PreciseTextOptions = {}) {
        if (!R.isString(text)) return;

        if (R.isNumber(options.fontMult)) {
            options.fontSize = this.fontSize * options.fontMult;
        }

        delete options.fontMult;

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

    #drawBorder() {
        const border = this.#border;
        if (!border) return;

        border.clear();
        border.lineStyle(this.selected ? this.selectedBorderOptions : this.borderOptions);
        border.drawRoundedRect(0, 0, this.width, this.height, this.borderRadius);
    }

    #drawBody(): NodePart {
        const body = new PIXI.Container() as NodePart;
        const entries = this.#node.entries;
        const outs = entries.outs.contents;
        const inputs = entries.inputs.contents;
        const outputs = entries.outputs.contents;
        const minEntryIndex = entries.in || outs.length ? 1 : 0;
        const nbRows = Math.max(inputs.length + minEntryIndex, outs.length + outputs.length);
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

        if (entries.in) {
            this.#in = new BlueprintBridgeEntry(this, "inputs", entries.in);
            this.#entries.push(this.#in);

            addToRow(0, this.#in);
        }

        const firstInputIndex = minEntryIndex;
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const entry = new BlueprintEntry(this, input);

            this.#inputs.set(entry.key, entry);
            this.#entries.push(entry);

            addToRow(i + firstInputIndex, entry);
        }

        // we process all outputs after that

        for (let i = 0; i < outs.length; i++) {
            const out = outs[i];
            const entry = new BlueprintBridgeEntry(this, "outputs", out);

            this.#outs.set(entry.key, entry);
            this.#entries.push(entry);

            addToRow(i, entry);
        }

        const firstoutputIndex = Math.max(outs.length, minEntryIndex);
        for (let i = 0; i < outputs.length; i++) {
            const output = outputs[i];
            const entry = new BlueprintEntry(this, output);

            this.#outputs.set(entry.key, entry);
            this.#entries.push(entry);

            addToRow(i + firstoutputIndex, entry);
        }

        // return

        const rowHeight = this.entryHeight + this.rowSpacing;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            row.x = padding.x;
            row.y = padding.y + i * rowHeight;

            body.addChild(row);
        }

        body.calculatedWith = padding.x * 2 + Math.max(...rows.map((row) => row.calculatedWith));
        body.calculatedHeight = nbRows * rowHeight + padding.y * 2;

        return body;
    }

    #createHeader(): NodeheaderPart | undefined {
        const title = this.#node.title;
        if (!R.isString(title)) return;

        const headerSource: NodeHeaderData = {
            background: this.#node.headerColor,
            icon: this.#node.icon,
            subtitle: this.#node.subtitle,
            title,
        };

        const data = new NodeHeader(headerSource);
        if (data.invalid) return;

        const padding = this.outerPadding;
        const headerEl = new PIXI.Container() as NodeheaderPart;
        const iconEl = this.fontAwesomeIcon(data.icon);
        const titleEl = this.preciseText(data.title);
        const subtitleEl = this.preciseText(data.subtitle, {
            fontMult: 0.93,
            fontStyle: "italic",
            fill: "d9d9d9",
        });

        alignHorizontally(headerEl, [iconEl, titleEl], { offset: padding, spacing: 5 });

        if (subtitleEl) {
            subtitleEl.x = titleEl.x + (iconEl ? 0 : 2);
            subtitleEl.y = getBottom(titleEl);

            headerEl.addChild(subtitleEl);
        }

        titleEl.getBounds();

        headerEl.background = new PIXI.Color(data.background ?? this.backgroundColor);
        headerEl.calculatedHeight = maxBottom(titleEl, subtitleEl) + padding.y;
        headerEl.calculatedWith = maxRight(titleEl, subtitleEl) + padding.x;

        return headerEl;
    }

    async createContextMenu(
        event: PIXI.FederatedPointerEvent,
        entries: Omit<ContextMenuEntry, "condition">[]
    ) {
        if (!entries.length) return;

        const anchor = createHTMLElement("div", {
            id: "trigger-engine-context-menu",
            style: {
                left: `${event.globalX}px`,
                top: `${event.globalY}px`,
                position: "absolute",
                zIndex: "100",
            },
        });

        document.body.appendChild(anchor);

        const menu = new foundry.applications.ux.ContextMenu.implementation(anchor, "", entries, {
            fixed: true,
            jQuery: false,
            onClose: () => {
                menu.close();
            },
        });

        await menu.render(anchor, {
            event: new PointerEvent("contextmenu", {
                clientX: event.globalX - 20,
                clientY: event.globalY - 10,
            }),
        });

        menu.element.addEventListener("pointerleave", () => {
            anchor.remove();
            menu.close();
        });
    }

    async #onNodeContextMenu(event: PIXI.FederatedPointerEvent) {
        const selected = this.parent.selected;
        const multiSelect = selected.length > 1;

        const entries: Omit<ContextMenuEntry, "condition">[] = [];

        if (!this.isLocked) {
            entries.push({
                name: localizePath(`blueprint.node.delete.${multiSelect ? "multi" : "single"}`),
                icon: `<i class="fa-solid fa-trash fa-fw"></i>`,
                callback: async () => {
                    const confirm = await confirmDialog("blueprint.node.delete.confirm");
                    return confirm && this.parent.deleteSelected();
                },
            });
        }

        this.createContextMenu(event, entries);
    }
}

interface BlueprintNode {
    readonly parent: BlueprintNodesLayer;
}

type ILineStyleOptions = Parameters<PIXI.Graphics["lineTextureStyle"]>[0];

type NodeheaderPart = NodePart & {
    background: PIXI.ColorSource;
};

type InteractionData = {
    origin: PIXI.Point;
    selected?: { node: BlueprintNode; origin: Point }[];
};

type PreciseTextOptions = Partial<PIXI.ITextStyle> & {
    fontMult?: number;
};

export { BlueprintNode };
export type { PreciseTextOptions };
