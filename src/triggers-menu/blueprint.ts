import { Trigger, TriggerDataSource, UpdateTriggerData } from "engine";
import { distanceToPoint, dividePointBy, onceDecorator, R, subtractPoint } from "module-helpers";
import { BlueprintApplication, BlueprintGridLayer, BlueprintLayers } from ".";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #drag: { origin: Point; dragging?: boolean } | null = null;
    #gridLayer: BlueprintGridLayer;
    #hitArea: PIXI.Rectangle;
    #layers: BlueprintLayers;
    #parent: BlueprintApplication;
    #triggerId: string | null = null;
    #triggers: Collection<Trigger>;

    constructor(parent: BlueprintApplication, triggers: TriggerDataSource[]) {
        super({
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio,
        });

        this.#parent = parent;

        this.#triggers = new Collection(
            R.pipe(
                triggers,
                R.map((source) => {
                    const trigger = this.parent.application.createTrigger(source);
                    return trigger && ([trigger.id, trigger] as const);
                }),
                R.filter(R.isTruthy)
            )
        );

        this.stage.addChild(
            (this.#gridLayer = new BlueprintGridLayer(this)),
            (this.#layers = new BlueprintLayers(this))
        );

        this.stage.eventMode = "static";
        this.stage.hitArea = this.#hitArea = new PIXI.Rectangle();
    }

    get parent(): BlueprintApplication {
        return this.#parent;
    }

    get applicationKey(): string {
        return this.parent.applicationKey;
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

    @onceDecorator()
    _initialize() {
        const element = (this.resizeTo = this.parent.element);

        element?.prepend(this.view);
        this.#layers._initialize();
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

        // this.render();
    }

    createTrigger(source: DeepPartial<TriggerDataSource>) {
        if (source._id && this.triggers.has(source._id)) return;

        const trigger = this.parent.application.createTrigger(source);
        if (!trigger || trigger.invalid) return;

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
        this.#layers.position.set(x, y);
        this.#gridLayer.tilePosition.set(x, y);
    }

    #onPointerUp(event: PIXI.FederatedPointerEvent) {
        const wasDragging = !!this.#drag?.dragging;

        this.#drag = null;
        this.#layers.interactiveChildren = true;

        this.stage.cursor = "default";
        this.stage.off("pointerup", this.#onPointerUp, this);
        this.stage.off("pointerupoutside", this.#onPointerUp, this);
        this.stage.off("pointermove", this.#onDragMove, this);

        // if (!wasDragging && this.trigger && !this.isTriggerLocked) {
        //     this.#onContextMenu(event.global);
        // }
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
