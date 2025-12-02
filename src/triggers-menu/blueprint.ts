import {
    NodeEntry,
    Trigger,
    TriggerApplication,
    TriggerDataSource,
    UpdateTriggerData,
} from "engine";
import { distanceToPoint, dividePointBy, MODULE, R, subtractPoint } from "module-helpers";
import {
    BlueprintApplication,
    BlueprintConnectionsLayer,
    BlueprintGridLayer,
    BlueprintNodesLayer,
    BlueprintNodesMenu,
} from ".";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #connections: BlueprintConnectionsLayer;
    #drag: { origin: Point; dragging?: boolean } | null = null;
    #gridLayer: BlueprintGridLayer;
    #hitArea: PIXI.Rectangle;
    #initialized: boolean = false;
    #layers: PIXI.Container;
    #nodes: BlueprintNodesLayer;
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

        this.#gridLayer = new BlueprintGridLayer(this);
        this.#layers = new PIXI.Container();

        this.#layers.addChild(
            (this.#connections = new BlueprintConnectionsLayer()),
            (this.#nodes = new BlueprintNodesLayer())
        );

        this.stage.addChild(this.#gridLayer, this.#layers);

        this.stage.eventMode = "static";
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

        // free application only has a single trigger so we set it right away
        if (this.application.isFreeApplication) {
            this.#triggerId = this.#triggers.contents[0].id;
        }
    }

    get parent(): BlueprintApplication {
        return this.#parent;
    }

    get application(): TriggerApplication {
        return this.parent.application;
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

        this.parent.render();
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

    _initialize() {
        if (this.#initialized) return;

        const element = (this.resizeTo = this.parent.element);

        element?.prepend(this.view);

        this.#initialized = true;
        this.activateListeners();
    }

    resizeAll(): void {
        this.resize();

        const fullHeight = this.screen.height / this.stage.scale.y;
        const fullWidth = this.screen.width / this.stage.scale.x;

        this.#hitArea.height = fullHeight;
        this.#hitArea.width = fullWidth;

        this.#gridLayer.height = fullHeight;
        this.#gridLayer.width = fullWidth;
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

    activateListeners() {
        this.stage.on("wheel", this.#onWheel, this);
        this.stage.on("pointerdown", this.#onPointerDown, this);
    }

    disableListeners() {
        this.stage.removeAllListeners();
    }

    getTrigger(triggerId: string): Trigger | null {
        return this.triggers.get(triggerId) ?? null;
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        if (event.button !== 2) return;

        this.#drag = {
            origin: this.#subtractPointFromEvent(event, this.#layers.position),
        };

        this.stage.on("pointermove", this.#onDragMove, this);
        this.stage.on("pointerup", this.#onPointerUp, this);
        this.stage.on("pointerupoutside", this.#onPointerUp, this);
    }

    #onDragMove(event: PIXI.FederatedPointerEvent) {
        if (!this.#drag) return;

        const { origin, dragging } = this.#drag;

        if (!dragging) {
            const target = this.#subtractPointFromEvent(event, this.#layers.position);
            const distance = distanceToPoint(target, origin);

            if (distance < 10) return;
        }

        this.#drag.dragging = true;
        this.#layers.interactiveChildren = false;

        const { x, y } = this.#subtractPointFromEvent(event, origin);

        this.stage.cursor = "grabbing";
        this.setPosition(x, y);
    }

    #onPointerUp(event: PIXI.FederatedPointerEvent) {
        const wasDragging = !!this.#drag?.dragging;

        this.#drag = null;
        this.#layers.interactiveChildren = true;

        this.stage.cursor = "default";
        this.stage.off("pointerup", this.#onPointerUp, this);
        this.stage.off("pointerupoutside", this.#onPointerUp, this);
        this.stage.off("pointermove", this.#onDragMove, this);

        if (!wasDragging && this.trigger?.locked === false) {
            this.#openNodesMenu(event.global);
        }
    }

    async #openNodesMenu({ x, y }: Point, entry?: NodeEntry) {
        const source = await BlueprintNodesMenu.wait(this.application, entry);
        if (!source) return;

        source.position = { x, y };

        try {
            const NodeCls = this.application.nodes.get(source);

            if (!NodeCls) {
                throw new Error("Couldn't find the TriggerNode class.");
            }

            const node = this.trigger?.addNode(NodeCls, source);

            if (node) {
                this.#nodes.add(node);
            }
        } catch (error) {
            MODULE.error(`an error ocurred while trying to create a TriggerNode.`, error);
        }
    }

    #onWheel(event: PIXI.FederatedWheelEvent) {
        const mult = event.deltaY < 0 ? 1 : -1;
        this.scale = this.stage.scale.x + 0.1 * mult;
    }

    #subtractPointFromEvent(event: PIXI.FederatedPointerEvent, point: Point): Point {
        return subtractPoint(dividePointBy(event.global, this.scale), point);
    }
}

export { Blueprint };
