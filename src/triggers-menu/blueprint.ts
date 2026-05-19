import {
    ConnectionId,
    OpenTrigger,
    splitEntryId,
    TriggerApplication,
    TriggerDataInput,
    TriggerFullId,
    TriggersSetting,
} from "engine";
import {
    MouseInteractionManager,
    R,
    TooltipDirection,
    confirmDialog,
    createHTMLElement,
    distanceToPoint,
    dividePointBy,
    localize,
    purgeObject,
    subtractPoint,
} from "foundry-helpers";
import {
    BaseBlueprintEntry,
    BlueprintApplication,
    BlueprintConnectionsLayer,
    BlueprintGridLayer,
    BlueprintLayers,
    BlueprintNode,
    BlueprintNodesLayer,
    BlueprintNodesMenu,
    editLabelDialog,
    splitTwoWays,
} from ".";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #disabledIds: Set<string> = new Set();
    #enabledIds: Set<string> = new Set();
    #gridLayer: BlueprintGridLayer;
    #hitArea: PIXI.Rectangle;
    #invalids: Collection<TriggerFullId, OpenTrigger> = new Collection();
    #layers: BlueprintLayers;
    #modulesFolders: Record<string, string>;
    #mouseManager: MouseInteractionManager;
    #parent: BlueprintApplication;
    #triggerId: TriggerFullId | null = null;
    #triggers: Collection<TriggerFullId, OpenTrigger> = new Collection();

    constructor(parent: BlueprintApplication) {
        super({
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio,
        });

        this.#parent = parent;

        this.stage.addChild(
            (this.#gridLayer = new BlueprintGridLayer(this)),
            (this.#layers = new BlueprintLayers(this)),
        );

        this.stage.hitArea = this.#hitArea = new PIXI.Rectangle();

        const triggersSetting = this.parent.getTriggersSetting();

        this.#modulesFolders = triggersSetting.folders;

        for (const id of triggersSetting.disabled) {
            this.#disabledIds.add(id);
        }

        for (const id of triggersSetting.enabled) {
            this.#enabledIds.add(id);
        }

        const allTriggers = R.pipe(
            [
                [triggersSetting.sources, false],
                [this.application.moduleSources, true],
            ] as const,
            R.flatMap(([sources, locked]) => {
                return R.pipe(
                    sources,
                    R.filter((source) => R.isObjectType(source) && "id" in source),
                    R.map((source) => {
                        const trigger = this.application.createTrigger(source, { locked });
                        return trigger && ([trigger.fullId, trigger] as const);
                    }),
                    R.filter(R.isTruthy),
                );
            }),
        );

        const [invalids, triggers] = R.partition(allTriggers, ([_, trigger]) => trigger.invalid);

        this.#invalids = new Collection(invalids);
        this.#triggers = new Collection(triggers);

        const handlers: ConstructorParameters<typeof MouseInteractionManager>[3] = {
            unclickLeft: this._onUnclickLeft.bind(this),
            unclickRight: this._onUnclickRight.bind(this),
            dragLeftStart: this._onDragLeftStart.bind(this),
            dragLeftMove: this._onDragLeftMove.bind(this),
            dragLeftDrop: this._onDragLeftDrop.bind(this),
            dragRightStart: this._onDragRightStart.bind(this),
            dragRightMove: this._onDragRightMove.bind(this),
        };

        const canHandleMouse = () => {
            return !!this.trigger;
        };

        const permissions: ConstructorParameters<typeof MouseInteractionManager>[2] = {
            ...R.mapValues(handlers, () => canHandleMouse),
            clickLeft: canHandleMouse,
            clickRight: canHandleMouse,
        };

        this.#mouseManager = new foundry.canvas.interaction.MouseInteractionManager(
            this.stage,
            this.stage,
            permissions,
            handlers,
            { application: this },
        );

        this.#mouseManager.activate();

        // free application only has a single trigger so we set it right away
        if (this.application.isFreeApplication) {
            this.trigger = this.#triggers.contents[0];
        }
    }

    get parent(): BlueprintApplication {
        return this.#parent;
    }

    get application(): TriggerApplication {
        return this.parent.application;
    }

    get grid(): BlueprintGridLayer {
        return this.#gridLayer;
    }

    get connections(): BlueprintConnectionsLayer {
        return this.#layers.connections;
    }

    get nodes(): BlueprintNodesLayer {
        return this.#layers.nodes;
    }

    get invalids(): Collection<TriggerFullId, OpenTrigger> {
        return this.#invalids;
    }

    get triggers(): Collection<TriggerFullId, OpenTrigger> {
        return this.#triggers;
    }

    get trigger(): OpenTrigger | undefined {
        return this.#triggerId ? this.triggers.get(this.#triggerId) : undefined;
    }

    set trigger(value: TriggerFullId | OpenTrigger | null) {
        const fullId = value instanceof OpenTrigger ? value.fullId : value;

        if (this.#triggerId === fullId) return;
        if (fullId && !this.triggers.has(fullId)) return;

        this.#triggerId = fullId;

        this.scale = 1;
        this.setPosition(0, 0);

        if (fullId) {
            this.draw();
        } else {
            this.#clear();
        }

        this.parent.render();
    }

    get locked(): boolean {
        return !!this.trigger?.locked;
    }

    get scale(): number {
        return this.stage.scale.x;
    }

    set scale(value) {
        const actualValue = Math.clamp(value, 0.5, 2);
        if (actualValue === this.scale) return;

        this.stage.scale.set(actualValue);
        this.resizeAll();
    }

    toggleLocked(locked: boolean) {
        this.stage.eventMode = locked ? "none" : "static";
        this.parent.toggleUIEnabled(locked);
    }

    resizeAll(): void {
        this.resize();

        const width = this.screen.width / this.stage.scale.x;
        const height = this.screen.height / this.stage.scale.y;

        this.#hitArea.height = height;
        this.#hitArea.width = width;

        this.#gridLayer.height = height;
        this.#gridLayer.width = width;
    }

    setPosition(x: number, y: number) {
        this.#layers.position.set(x, y);
        this.#gridLayer.tilePosition.set(x, y);
    }

    moveToNode(nodeId: string, select: boolean) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        const nodePosition = node.position;
        const layerPosition = this.#layers.position;
        const targetPosition = subtractPoint({ x: 600, y: 350 }, nodePosition);
        const distance = distanceToPoint(layerPosition, targetPosition);
        const tilePosition = this.#gridLayer.tilePosition;

        foundry.canvas.animation.CanvasAnimation.animate(
            [
                {
                    parent: layerPosition,
                    attribute: "x",
                    to: targetPosition.x,
                },
                {
                    parent: layerPosition,
                    attribute: "y",
                    to: targetPosition.y,
                },
                {
                    parent: tilePosition,
                    attribute: "x",
                    to: targetPosition.x,
                },
                {
                    parent: tilePosition,
                    attribute: "y",
                    to: targetPosition.y,
                },
                {
                    parent: this,
                    attribute: "scale",
                    to: 1,
                },
            ],
            { duration: Math.min(distance / 4, 500) },
        );

        if (select) {
            node.selectOnly();
        }
    }

    addTrigger(source: TriggerDataInput, setEnabled: boolean, setTrigger: boolean) {
        if (this.application.events.size === 1 && !source.nodes?.length) {
            const event = this.application.events.contents[0];

            source.nodes = [
                {
                    id: foundry.utils.randomID(),
                    position: { x: 400, y: 200 },
                    type: event.type,
                },
            ];
        }

        const trigger = this.application.createTrigger(source, {});
        if (!trigger) return;

        this.triggers.set(trigger.fullId, trigger);

        if (setTrigger) {
            this.trigger = trigger;
        }

        if (setEnabled) {
            this.enableTrigger(trigger, true);
        }
    }

    async deleteTrigger(fullId: TriggerFullId) {
        const confirm = await confirmDialog("blueprint.trigger.delete");
        if (!confirm) return;

        this.invalids.delete(fullId);
        this.triggers.delete(fullId);

        this.parent.render();
    }

    async saveTriggers(): Promise<Required<TriggersSetting> | undefined> {
        if (!this.application.isSettingApplication) return;

        const [locked, triggers] = R.partition(this.triggers.contents, (trigger) => trigger.locked);
        const sources = R.map([...triggers, ...this.invalids], (trigger) => trigger.toObject());
        const triggersIds = R.map(triggers, (trigger) => trigger.id);
        const lockedIds = R.map(locked, (trigger) => trigger.id);

        const disabled = [...this.#disabledIds].filter((id) => R.isIncludedIn(id, triggersIds));
        const enabled = [...this.#enabledIds].filter((id) => R.isIncludedIn(id, lockedIds));
        const folders = R.pick(this.#modulesFolders, lockedIds) as Record<string, string>;

        const setting: Required<TriggersSetting> = {
            disabled,
            enabled,
            folders,
            sources: purgeObject(sources),
        };

        await game.settings.set(this.application.moduleId, this.application.settingKey, setting);
        localize.info("save-triggers.saved");
    }

    isEnabled({ id, locked }: OpenTrigger): boolean {
        return locked ? this.#enabledIds.has(id) : !this.#disabledIds.has(id);
    }

    enableTrigger({ id, locked }: OpenTrigger, enabled: boolean) {
        if (enabled) {
            if (locked) {
                this.#enabledIds.add(id);
            } else {
                this.#disabledIds.delete(id);
            }
        } else {
            if (locked) {
                this.#enabledIds.delete(id);
            } else {
                this.#disabledIds.add(id);
            }
        }
    }

    getFolder({ folder, id, locked }: MaybeTrigger): string {
        return (locked ? (this.#modulesFolders[id] ?? folder) : folder) ?? "";
    }

    setFolder({ id, locked }: MaybeTrigger, folder: string) {
        if (!locked) return;

        this.#modulesFolders[id] = folder;
        this.parent.render();
    }

    resetFolder({ id, locked }: MaybeTrigger) {
        if (!locked) return;

        delete this.#modulesFolders[id];
        this.parent.render();
    }

    async editVariable(id: ConnectionId) {
        const trigger = this.trigger;
        if (!trigger) return;

        const current = trigger.data.variables[id]?.label;
        if (current === undefined) return;

        const label = await editLabelDialog("variable", { placeholder: current, value: current });
        if (!label) return;

        trigger.update({
            variables: {
                [id]: { label },
            },
        });

        const [nodeId] = splitEntryId(id);
        if (nodeId) {
            trigger.refreshNode(nodeId);
        }

        const variables = this.nodes.getVariables(id);
        for (const node of variables) {
            trigger.refreshNode(node.id);
        }

        this.draw({ renderApplication: true });
    }

    deleteVariable(id: ConnectionId, redraw: boolean = true) {
        const trigger = this.trigger;
        if (!trigger?.data.variables[id]) return;

        trigger?.update({
            variables: {
                [id]: undefined,
            },
        });

        const nodes = this.nodes.getVariables(id);
        this.nodes.delete(nodes, redraw);
    }

    getInvalidTrigger(fullId: TriggerFullId): OpenTrigger | null {
        return this.invalids.get(fullId) ?? null;
    }

    getTrigger(fullId: TriggerFullId): OpenTrigger | null {
        return this.triggers.get(fullId) ?? null;
    }

    cancelMouse() {
        this.#mouseManager.cancel();
    }

    unscalePoint(point: Point): Point {
        return dividePointBy(point, this.scale);
    }

    subtractPointFromEvent(event: PIXI.FederatedPointerEvent, point: Point): Point {
        return subtractPoint(this.unscalePoint(event.global), point);
    }

    getGlobalBounds(element: PIXI.Container): PIXI.Rectangle {
        const scale = this.stage.scale;
        const position = element.getGlobalPosition();
        const viewBounds = this.view.getBoundingClientRect();

        const x = position.x + viewBounds.x;
        const y = position.y + viewBounds.y;
        const width = element.width * scale.x;
        const height = element.height * scale.y;

        return new PIXI.Rectangle(x, y, width, height);
    }

    async openNodesMenu(event: PIXI.FederatedPointerEvent, entry?: BaseBlueprintEntry): Promise<boolean | undefined> {
        if (this.locked) return;

        // we need to calculate it now as FederatedEvent will be reused
        const position = this.subtractPointFromEvent(event, this.#layers);

        this.toggleLocked(true);
        const result = await BlueprintNodesMenu.wait(this, position, entry);
        this.toggleLocked(false);

        if (result) {
            this.parent.render();
        }

        return !!result;
    }

    addTooltip(target: PIXI.Container, tooltipFn: () => string | undefined, direction: TooltipDirection) {
        target.eventMode = "static";
        target.hitArea = new PIXI.Rectangle(0, 0, target.width, target.height);

        target.on("pointerenter", (event) => {
            event.stopPropagation();

            const tooltip = tooltipFn();
            if (!tooltip) return;

            const offset = 5 * this.scale;
            const { left, top, width, height } = this.getGlobalBounds(target);
            const anchor = createHTMLElement("div", {
                id: "trigger-engine-field-tooltip",
                style: {
                    left: `${left - offset}px`,
                    top: `${top}px`,
                    width: `${width + offset * 2}px`,
                    height: `${height}px`,
                },
            });

            document.body.appendChild(anchor);

            game.tooltip.activate(anchor, {
                cssClass: "trigger-engine-field-tooltip",
                direction,
                html: tooltip,
            });
        });

        target.on("pointerleave", (event) => {
            event.stopPropagation();
            game.tooltip.deactivate();
            document.getElementById("trigger-engine-field-tooltip")?.remove();
        });
    }

    draw({
        forceComputeConnections,
        renderApplication,
        selectNodes,
    }: {
        forceComputeConnections?: boolean;
        renderApplication?: boolean;
        selectNodes?: string[];
    } = {}) {
        selectNodes ??= this.nodes.selected.map((node) => node.id);

        this.#clear();

        const trigger = this.trigger;
        if (!trigger) return;

        trigger.computeConnections(forceComputeConnections);

        for (const node of trigger.nodes) {
            this.nodes.add(node, false);
        }

        for (const twoWays of trigger.linkedConnections) {
            const [originId, targetId] = splitTwoWays(twoWays);
            const origin = this.nodes.getEntryFromId(originId);
            const target = this.nodes.getEntryFromId(targetId);

            if (origin && target) {
                this.connections.add(origin.id, target.id);
            }
        }

        this.stage.on("wheel", this.#onWheel, this);

        if (selectNodes.length) {
            this.nodes.selectNodes(selectNodes);
        }

        if (renderApplication) {
            this.parent.render();
        }
    }

    _onUnclickLeft() {
        this.nodes.clearSelected();
        this.#destroySelection();
    }

    _onUnclickRight(event: FederatedEvent) {
        this.openNodesMenu(event);
        this.#destroySelection();
    }

    #selection: PIXI.Graphics | null = null;

    _onDragLeftStart(event: FederatedEvent) {
        this.nodes.clearSelected();
        this.#selection?.destroy();

        const interactionData = event.interactionData as InteractionData;

        this.nodes.interactiveChildren = false;

        interactionData.layerOrigin = this.subtractPointFromEvent(event, this.#layers);
        this.#selection = this.#layers.addChild(new PIXI.Graphics());
    }

    _onDragLeftMove(event: FederatedEvent) {
        const selection = this.#selection as PIXI.Graphics;
        const layerOrigin = event.interactionData.layerOrigin as Point;
        const target = this.subtractPointFromEvent(event, this.#layers);

        const width = Math.abs(target.x - layerOrigin.x);
        const height = Math.abs(target.y - layerOrigin.y);
        selection.x = Math.min(layerOrigin.x, target.x);
        selection.y = Math.min(layerOrigin.y, target.y);

        selection.clear();
        selection.lineStyle(2, BlueprintNode.SELECTED_COLOR, 0.9);
        selection.drawRect(0, 0, width, height);
    }

    _onDragLeftDrop(_event: FederatedEvent) {
        const selection = this.#selection;
        if (!selection) return;

        this.nodes.selectIntersecting(selection);
        this.nodes.interactiveChildren = true;
        this.#layers.removeChild(selection);
    }

    _onDragRightStart(event: FederatedEvent) {
        const interactionData = event.interactionData as InteractionData;
        interactionData.layerOrigin = this.subtractPointFromEvent(event, this.#layers);
    }

    _onDragRightMove(event: FederatedEvent) {
        const layerOrigin = event.interactionData.layerOrigin as Point;
        const { x, y } = this.subtractPointFromEvent(event, layerOrigin);

        this.setPosition(x, y);
    }

    #clear() {
        this.#destroySelection();
        this.#layers.clear();
        this.stage.off("wheel", this.#onWheel, this);
    }

    #onWheel(event: PIXI.FederatedWheelEvent) {
        if (this.#mouseManager.state > this.#mouseManager.states.HOVER) return;

        const mult = event.deltaY < 0 ? 1 : -1;
        this.scale = this.stage.scale.x + 0.1 * mult;
    }

    #destroySelection() {
        if (!this.#selection) return;
        this.#selection.destroy();
        this.#selection = null;
    }
}

type FederatedEvent = PIXI.FederatedPointerEvent & {
    interactionData: Record<string, any>;
};

type InteractionData = {
    layerOrigin: Point;
};

type MaybeTrigger = { folder: string | undefined; id: string; locked?: boolean };

export { Blueprint };
export type { MaybeTrigger };
