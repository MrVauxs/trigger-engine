import {
    ConnectionId,
    getInputsSchemas,
    getOutputsSchemas,
    getOutsSchemas,
    OpenTrigger,
    TriggerApplication,
    TriggerDataSource,
    TriggerNode,
    UpdateNodeData,
    UpdateTriggerData,
} from "engine";
import { dividePointBy, MouseInteractionManager, R, subtractPoint } from "module-helpers";
import {
    BaseBlueprintEntry,
    BlueprintApplication,
    BlueprintConnectionsLayer,
    BlueprintGridLayer,
    BlueprintLayers,
    BlueprintNode,
    BlueprintNodesLayer,
    BlueprintNodesMenu,
    EntryId,
    isBlueprintEntry,
    PreciseEntryCategory,
} from ".";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #gridLayer: BlueprintGridLayer;
    #hitArea: PIXI.Rectangle;
    #layers: BlueprintLayers;
    #mouseManager: MouseInteractionManager;
    #parent: BlueprintApplication;
    #triggerId: string | null = null;
    #triggers: Collection<OpenTrigger> = new Collection();

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
            (this.#layers = new BlueprintLayers(this))
        );

        this.stage.hitArea = this.#hitArea = new PIXI.Rectangle();

        this.#triggers = new Collection(
            R.pipe(
                this.parent.getTriggersSources(),
                R.map((source) => {
                    const trigger = this.application.createTrigger(source, true);
                    return trigger && ([trigger.id, trigger] as const);
                }),
                R.filter(R.isTruthy)
            )
        );

        const handlers: ConstructorParameters<typeof MouseInteractionManager>[3] = {
            unclickLeft: this._onUnclickLeft.bind(this),
            unclickRight: this._onUnclickRight.bind(this),
            dragLeftStart: this._onDragLeftStart.bind(this),
            dragLeftMove: this._onDragLeftMove.bind(this),
            dragLeftDrop: this._onDragLeftDrop.bind(this),
            dragRightStart: this._onDragRightStart.bind(this),
            dragRightMove: this._onDragRightMove.bind(this),
        };

        const permissions: ConstructorParameters<typeof MouseInteractionManager>[2] = {
            ...R.mapValues(handlers, () => this._canHandleMouseEvent.bind(this)),
            clickLeft: this._canHandleMouseEvent.bind(this),
            clickRight: this._canHandleMouseEvent.bind(this),
        };

        this.#mouseManager = new foundry.canvas.interaction.MouseInteractionManager(
            this.stage,
            this.stage,
            permissions,
            handlers,
            { application: this }
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

    get applicationKey(): string {
        return this.application.applicationKey;
    }

    get triggers(): Collection<OpenTrigger> {
        return this.#triggers;
    }

    get trigger(): OpenTrigger | undefined {
        return this.#triggerId ? this.triggers.get(this.#triggerId) : undefined;
    }

    set trigger(value: string | OpenTrigger | null) {
        const triggerId = value instanceof OpenTrigger ? value.id : value;
        if (this.#triggerId === triggerId) return;
        if (triggerId && !this.triggers.has(triggerId)) return;

        this.#triggerId = triggerId;

        this.scale = 1;
        this.setPosition(0, 0);

        if (triggerId) {
            this.#draw();
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

    addTrigger(source: DeepPartial<TriggerDataSource>) {
        if (source._id && this.triggers.has(source._id)) return;

        const trigger = this.application.createTrigger(source, true);
        if (!trigger) return;

        this.triggers.set(trigger.id, trigger);
        this.trigger = trigger;
    }

    updateTrigger(id: string, updates: UpdateTriggerData) {
        const trigger = this.triggers.get(id);
        if (!trigger) return;

        trigger.update(updates);
        this.parent.render();
    }

    updateNode(id: string, updates: UpdateNodeData) {
        const trigger = this.trigger;
        if (!trigger) return;

        trigger.updateNode(id, updates);
        this.parent.render();
    }

    deleteTrigger(id: string) {
        this.triggers.delete(id);
        this.parent.render();
    }

    getTrigger(triggerId: string): OpenTrigger | null {
        return this.triggers.get(triggerId) ?? null;
    }

    cancelMouse() {
        this.#mouseManager.cancel();
    }

    subtractPointFromEvent(event: PIXI.FederatedPointerEvent, point: Point): Point {
        return subtractPoint(dividePointBy(event.global, this.scale), point);
    }

    async openNodesMenu(
        event: PIXI.FederatedPointerEvent,
        entry?: BaseBlueprintEntry
    ): Promise<{ node: BlueprintNode; selectedId: EntryId | undefined } | undefined> {
        // we need to calculate it now as FederatedEvent will be reused
        const position = this.subtractPointFromEvent(event, this.#layers);

        this.toggleLocked(true);
        const source = await BlueprintNodesMenu.wait(this.application, entry);
        this.toggleLocked(false);

        if (!source) return;

        const OtherCls = this.application.nodes.get(source.type) as typeof TriggerNode;
        if (!OtherCls) return;

        source.position = position;

        let selectedIdSuffix: `${PreciseEntryCategory}:${string}` | undefined;

        if (entry?.isOutput) {
            if (isBlueprintEntry(entry)) {
                const otherEntry = getInputsSchemas(OtherCls).find(
                    (other) => other.type === entry.type
                );

                if (otherEntry) {
                    selectedIdSuffix = `inputs:${otherEntry.key}`;
                    source.inputs = {
                        [otherEntry.key]: {
                            connections: [entry.id as ConnectionId],
                        },
                    };
                }
            } else {
                selectedIdSuffix = "ins:in";
                source.ins = {
                    in: {
                        connections: [entry.id as ConnectionId],
                    },
                };
            }
        }

        const node = this.trigger?.addNode(source);
        if (!node) return;

        if (entry?.isInput) {
            if (isBlueprintEntry(entry)) {
                const otherEntry = getOutputsSchemas(OtherCls).find(
                    (other) => other.type === entry.type
                );
                selectedIdSuffix = otherEntry ? `outputs:${otherEntry.key}` : undefined;
            } else {
                const out = getOutsSchemas(OtherCls).at(0);
                selectedIdSuffix = out ? `outs:${out}` : undefined;
            }
        }

        const selectedId: EntryId | undefined = selectedIdSuffix
            ? `${node.id}:${selectedIdSuffix}`
            : undefined;

        if (entry && selectedId) {
            // we do it before creating the node so we don't have to update it
            this.trigger?.addComputedConnections(entry.id, selectedId);
        }

        const blueprintNode = this.nodes.add(node, true);

        if (entry && selectedId) {
            this.connections.addConnection(entry.id, selectedId);
        }

        if (entry?.isInput) {
            entry.node.draw();
        }

        return { node: blueprintNode, selectedId };
    }

    _canHandleMouseEvent() {
        return !!this.trigger;
    }

    _onUnclickLeft(event: FederatedEvent) {
        this.nodes.clearSelected();
    }

    _onUnclickRight(event: FederatedEvent) {
        this.openNodesMenu(event);
    }

    _onDragLeftStart(event: FederatedEvent) {
        this.nodes.clearSelected();

        const interactionData = event.interactionData as InteractionData;

        interactionData.layerOrigin = this.subtractPointFromEvent(event, this.#layers);
        interactionData.selection = this.#layers.addChild(new PIXI.Graphics());
    }

    _onDragLeftMove(event: FederatedEvent) {
        const { layerOrigin, selection } = event.interactionData as InteractionData;
        const target = this.subtractPointFromEvent(event, this.#layers);

        const width = Math.abs(target.x - layerOrigin.x);
        const height = Math.abs(target.y - layerOrigin.y);
        selection.x = Math.min(layerOrigin.x, target.x);
        selection.y = Math.min(layerOrigin.y, target.y);

        selection.clear();
        selection.lineStyle(2, BlueprintNode.SELECTED_COLOR, 0.9);
        selection.drawRect(0, 0, width, height);
    }

    _onDragLeftDrop(event: FederatedEvent) {
        const selection = event.interactionData.selection as PIXI.Graphics | undefined;
        if (!selection) return;

        this.nodes.selectIntersecting(selection);

        this.#layers.removeChild(selection);
        selection.destroy();
    }

    _onDragRightStart(event: FederatedEvent) {
        const interactionData = event.interactionData as InteractionData;
        interactionData.layerOrigin = this.subtractPointFromEvent(event, this.#layers);
    }

    _onDragRightMove(event: FederatedEvent) {
        const { layerOrigin } = event.interactionData as InteractionData;
        const { x, y } = this.subtractPointFromEvent(event, layerOrigin);

        this.setPosition(x, y);
    }

    #draw() {
        this.#clear();

        const trigger = this.trigger;
        if (!trigger) return;

        trigger.computeConnections();

        for (const node of trigger.nodes) {
            this.nodes.add(node, false);
        }

        for (const twoWays of trigger.linkedConnections) {
            const [originId, targetId] = R.split(twoWays, "-");
            const origin = this.nodes.getEntryFromId(originId);
            const target = this.nodes.getEntryFromId(targetId);

            if (origin && target) {
                this.connections.addConnection(origin.id, target.id);
            }
        }

        this.stage.on("wheel", this.#onWheel, this);
    }

    #clear() {
        this.#layers.clear();
        this.stage.off("wheel", this.#onWheel, this);
    }

    #onWheel(event: PIXI.FederatedWheelEvent) {
        if (this.#mouseManager.state > this.#mouseManager.states.HOVER) return;

        const mult = event.deltaY < 0 ? 1 : -1;
        this.scale = this.stage.scale.x + 0.1 * mult;
    }
}

type FederatedEvent = PIXI.FederatedPointerEvent & {
    interactionData: Record<string, any>;
};

type InteractionData = {
    layerOrigin: Point;
    selection: PIXI.Graphics;
};

export { Blueprint };
