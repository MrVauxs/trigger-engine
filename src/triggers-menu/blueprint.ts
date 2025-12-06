import {
    NodeEntry,
    Trigger,
    TriggerApplication,
    TriggerDataSource,
    UpdateTriggerData,
} from "engine";
import { dividePointBy, MODULE, MouseInteractionManager, R, subtractPoint } from "module-helpers";
import {
    BlueprintApplication,
    BlueprintConnectionsLayer,
    BlueprintGridLayer,
    BlueprintLayers,
    BlueprintNode,
    BlueprintNodesLayer,
    BlueprintNodesMenu,
} from ".";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #gridLayer: BlueprintGridLayer;
    #hitArea: PIXI.Rectangle;
    #layers: BlueprintLayers;
    #mouseManager: MouseInteractionManager;
    #parent: BlueprintApplication;
    #triggerId: string | null = null;
    #triggers: Collection<Trigger> = new Collection();

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
                    const trigger = this.application.createTrigger(source);
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

        this.#mouseManager = new foundry.canvas.interaction.MouseInteractionManager(
            this.stage,
            this.stage,
            {
                ...R.mapValues(handlers, () => this._canHandleMouseEvent.bind(this)),
                clickLeft: this._canHandleMouseEvent.bind(this),
                clickRight: this._canHandleMouseEvent.bind(this),
            },
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

    get triggers(): Collection<Trigger> {
        return this.#triggers;
    }

    get trigger(): Trigger | undefined {
        return this.#triggerId ? this.triggers.get(this.#triggerId) : undefined;
    }

    set trigger(value: string | Trigger | null) {
        const triggerId = value instanceof Trigger ? value.id : value;
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

        const trigger = this.application.createTrigger(source);
        if (!trigger) return;

        this.triggers.set(trigger.id, trigger);
        this.trigger = trigger;
    }

    editTrigger(triggerId: string, data: UpdateTriggerData) {
        const trigger = this.triggers.get(triggerId);
        if (!trigger) return;

        trigger.update(data);
        this.parent.render();
    }

    getTrigger(triggerId: string): Trigger | null {
        return this.triggers.get(triggerId) ?? null;
    }

    cancelMouse() {
        this.#mouseManager.cancel();
    }

    subtractPointFromEvent(event: PIXI.FederatedPointerEvent, point: Point): Point {
        return subtractPoint(dividePointBy(event.global, this.scale), point);
    }

    _canHandleMouseEvent() {
        return !!this.trigger;
    }

    _onUnclickLeft(event: FederatedEvent) {
        this.nodes.clearSelected();
    }

    _onUnclickRight(event: FederatedEvent) {
        this.#openNodesMenu(event);
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

        for (const node of trigger.nodes) {
            this.nodes.add(node);
        }

        // TODO add connections as well

        this.stage.on("wheel", this.#onWheel, this);
    }

    #clear() {
        this.stage.off("wheel", this.#onWheel, this);
        this.#layers.clear();
    }

    async #openNodesMenu(event: FederatedEvent, entry?: NodeEntry) {
        const source = await BlueprintNodesMenu.wait(this.application, entry);
        if (!source) return;

        source.position = this.subtractPointFromEvent(event, this.#layers);

        try {
            const NodeCls = this.application.nodes.get(source);

            if (!NodeCls) {
                throw new Error("Couldn't find the TriggerNode class.");
            }

            const node = this.trigger?.addNode(NodeCls, source);

            if (node) {
                this.nodes.add(node);
                // TODO add connection if entry provided
            }
        } catch (error) {
            MODULE.error(`an error ocurred while trying to create a TriggerNode.`, error);
        }
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
