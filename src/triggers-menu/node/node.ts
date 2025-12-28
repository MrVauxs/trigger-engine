import { IconObject } from "_zod";
import {
    BaseCustomData,
    BaseCustomEntryDataSource,
    BaseCustomEntrySchema,
    BaseCustomSchema,
    BaseEntrySchemaInput,
    ConnectionId,
    EntryCategory,
    isConnectionId,
    isOppositeConnection,
    NodeData,
    OpenTrigger,
    OpenTriggerNode,
    TriggerNode,
    zCustomInputData,
    zCustomInputSchema,
    zCustomOutData,
    zCustomOutputData,
    zCustomOutputSchema,
    zCustomOutSchema,
} from "engine";
import {
    confirmDialog,
    createHTMLElement,
    drawRectangleMask,
    localize,
    LocalizeArgs,
    localizePath,
    mapToObjByKey,
    MouseInteractionManager,
    R,
    subtractPoint,
    waitDialog,
    warning,
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
    NodeHeaderSource,
    NodePart,
    PreciseEntryCategory,
    zNodeHeaderData,
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

    get type(): string {
        return this.#node.type;
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

    get isDuplicable(): boolean {
        // TODO also exclude variables & gate exist
        return !this.isEvent;
    }

    get label(): string {
        return this.#node.title ?? this.#node.id;
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
            () => !this.isLocked
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

    rootLocalize(...args: LocalizeArgs): string | undefined {
        return this.#node.rootLocalize(...args);
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
        this.data.update({ position: { x, y } });

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

        this.data.update({
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
            this.data.update({
                [category]: {
                    [key]: {
                        connections,
                        value: undefined,
                    },
                },
            });
        } else {
            this.data.update({
                [category]: {
                    [key]: undefined,
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

        const headerSource: NodeHeaderSource = {
            background: this.#node.headerColor ?? undefined,
            icon: this.#node.icon,
            subtitle: this.#node.subtitle,
            title,
        };

        const { data } = zNodeHeaderData.safeParse(headerSource);
        if (!data) return;

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

    doubleLocalize(label: string | undefined, ...path: string[]): string | undefined {
        return label ? game.i18n.localize(label) : this.localize(...path);
    }

    refresh({
        forceComputeConnections,
        renderApplication,
    }: {
        forceComputeConnections?: boolean;
        renderApplication?: boolean;
    } = {}) {
        this.trigger.refreshNode(this.id);
        this.blueprint.draw({
            forceComputeConnections,
            renderApplication,
            selectNodes: [this.id],
        });
    }

    #switchState(state: string) {
        this.data.update({ revealed: undefined, state });
        // TODO we gonna want to delete variables
        this.refresh({
            forceComputeConnections: true,
            renderApplication: true,
        });
    }

    #revealEntry(category: EntryCategory, schema: BaseEntrySchemaInput) {
        this.data.update({
            revealed: {
                [category]: { [schema.key]: true },
            },
        });
        this.refresh();
    }

    #customEntryLocalize(
        label: string | undefined,
        category: EntryCategory | "outs",
        schema: BaseCustomSchema,
        ...path: string[]
    ): string | undefined {
        return this.doubleLocalize(label, "custom", category, schema.slug, ...path);
    }

    #customEntryLabel(category: EntryCategory | "outs", schema: BaseCustomSchema): string {
        return this.#customEntryLocalize(schema.label, category, schema, "label") ?? schema.slug;
    }

    async #addCustomEntry(category: EntryCategory | "outs", schema: BaseCustomSchema) {
        const isEdit = false;

        const title = this.#customEntryLabel(category, schema);

        const label: CustomEntryDialogData["label"] = !schema.input?.replaceLabel && {
            value: "",
            placeholder:
                this.#customEntryLocalize(schema.placeholder, category, schema, "placeholder") ??
                schema.placeholder,
        };

        const input: CustomEntryDialogData["input"] = schema.input && {
            label:
                this.#customEntryLocalize(schema.input.label, category, schema, "input.label") ??
                "input",
            placeholder: this.#customEntryLocalize(
                schema.input.placeholder,
                category,
                schema,
                "input.placeholder"
            ),
            value: "",
        };

        const dialogData: CustomEntryDialogData = {
            input,
            label,
            type: undefined,
        };

        if (category !== "outs") {
            const availableTypes = this.trigger.application.entries.map((entry) => entry.type);

            const selectedTypes = (schema as BaseCustomEntrySchema).types?.filter((type) =>
                R.isIncludedIn(type, availableTypes)
            );

            dialogData.array = (schema as BaseCustomEntrySchema).array ? {} : undefined;

            dialogData.types = R.map(
                selectedTypes?.length ? selectedTypes : availableTypes,
                (type) => {
                    return {
                        value: type,
                        label: this.rootLocalize("entry", type, "title") ?? type,
                    };
                }
            );
        }

        const result = await waitDialog<{
            label?: string;
            input?: string;
            array?: boolean;
            type?: string;
        }>({
            content: "edit-entry",
            data: dialogData,
            disabled: true,
            i18n: "edit-entry",
            title: localize("blueprint.entry", isEdit ? "edit" : "add", { label: title }),
            yes: {
                label: localize("edit-entry.yes", isEdit ? "edit" : "add"),
            },
        });

        if (!result) return;

        if (schema.input && !result.input) {
            warning("edit-entry.required", { name: input?.label });
            return;
        }

        if (!dialogData.types && !result.label) {
            warning("edit-entry.required", { name: localize("edit-entry.label") });
            return;
        }

        const entrySchema: BaseCustomData = {
            input: result.input,
            label:
                (schema.input?.replaceLabel ? result.input : result.label) ||
                dialogData.types?.find((type) => type.value === result.type)?.label ||
                "",
            slug: schema.slug,
        };

        if (result.type) {
            foundry.utils.mergeObject(entrySchema, {
                type: result.type,
                isArray: result.array,
            } satisfies Omit<BaseCustomEntryDataSource, keyof BaseCustomData>);
        }

        const parser =
            category === "inputs"
                ? zCustomInputData
                : category === "outputs"
                ? zCustomOutputData
                : zCustomOutData;

        const entry = parser.safeParse(entrySchema)?.data;
        if (!entry) return;

        const entries = this.data.custom[category].slice();
        entries.push(entry as any);

        this.data.update({
            custom: {
                [category]: entries,
            },
        });

        this.refresh();
    }

    async #onNodeContextMenu(event: PIXI.FederatedPointerEvent) {
        const locked = this.isLocked;
        const selected = this.parent.selected;
        const entries: Omit<ContextMenuEntry, "condition">[] = [];

        // states
        if (!locked && this.#node.states && this.#node.state) {
            entries.push(
                ...R.pipe(
                    this.#node.states,
                    R.filter((state) => state !== this.#node.state),
                    R.map((state) => {
                        const label = this.#node.localize("states", state) ?? state;

                        return {
                            name: localize("blueprint.node.state", { label }),
                            icon: `<i class="fa-sharp fa-solid fa-arrows-repeat"></i>`,
                            callback: async () => {
                                this.#switchState(state);
                            },
                        };
                    })
                )
            );
        }

        // hidden entries
        if (!locked) {
            const categories = [
                ["inputs", "defineInputs"],
                ["outputs", "defineOutputs"],
            ] as const;

            for (const [category, method] of categories) {
                const allSchemas = (this.#node.constructor as typeof TriggerNode)[method] ?? [];
                const schemas = R.pipe(
                    allSchemas,
                    R.filter((schema) => {
                        return (
                            !!schema.hidden &&
                            (!schema.state || schema.state === this.#node.state) &&
                            !this.data.revealed?.[category]?.[schema.key]
                        );
                    })
                );

                for (const schema of schemas) {
                    const label =
                        this.doubleLocalize(schema.label, category, schema.key) ?? schema.key;

                    entries.push({
                        name: localize("blueprint.entry.add", { label }),
                        icon: `<i class="fa-solid fa-pen-line"></i>`,
                        callback: async () => {
                            this.#revealEntry(category, schema);
                        },
                    });
                }
            }
        }

        // custom entries
        if (!locked) {
            const categories = [
                ["outs", "defineCustomOuts", zCustomOutSchema],
                ["inputs", "defineCustomInputs", zCustomInputSchema],
                ["outputs", "defineCustomOutputs", zCustomOutputSchema],
            ] as const;

            for (const [category, method, parser] of categories) {
                const schemas = R.pipe(
                    (this.#node.constructor as typeof TriggerNode)[method] ?? [],
                    R.map((schema) => parser.safeParse(schema)?.data),
                    R.filter(R.isTruthy)
                );

                for (const schema of schemas) {
                    const label = this.#customEntryLabel(category, schema);

                    entries.push({
                        name: localize("blueprint.entry.add", { label }),
                        icon: `<i class="fa-solid fa-gear"></i>`,
                        callback: async () => {
                            this.#addCustomEntry(category, schema);
                        },
                    });
                }
            }
        }

        // duplicate & copy
        if (this.isDuplicable) {
            const filtered = selected.filter((node) => node.isDuplicable);
            const multiSelect = filtered.length > 1 ? "multi" : "single";

            entries.push({
                name: localizePath(`blueprint.node.copy.${multiSelect}`),
                icon: `<i class="fa-solid fa-clipboard"></i>`,
                callback: async () => {
                    this.parent.copySelected(selected);
                },
            });

            if (!locked) {
                entries.push({
                    name: localizePath(`blueprint.node.duplicate.${multiSelect}`),
                    icon: `<i class="fa-solid fa-copy"></i>`,
                    callback: async () => {
                        this.parent.duplicateSelected(selected);
                    },
                });
            }
        }

        // delete
        if (!locked) {
            const multiSelect = selected.length > 1 ? "multi" : "single";

            entries.push({
                name: localizePath(`blueprint.node.delete.${multiSelect}`),
                icon: `<i class="fa-solid fa-trash fa-fw"></i>`,
                callback: async () => {
                    // TODO we gonna want to delete variables
                    const confirm = await confirmDialog("blueprint.node.delete.confirm");
                    return confirm && this.parent.delete(selected);
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

type CustomEntryDialogData = {
    array?: {};
    input?: { label: string; placeholder: string | undefined; value: string };
    label: { placeholder: string | undefined; value: string } | false;
    type: string | undefined;
    types?: RequiredSelectOptions;
};

export { BlueprintNode };
export type { PreciseTextOptions };
