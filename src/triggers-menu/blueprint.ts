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
    BlueprintLayers,
    BlueprintNode,
    BlueprintNodesLayer,
    BlueprintNodesMenu,
} from ".";

class Blueprint extends PIXI.Application<HTMLCanvasElement> {
    #drag: { origin: Point; dragging?: boolean; selection?: PIXI.Graphics } | null = null;
    #gridLayer: BlueprintGridLayer;
    #hitArea: PIXI.Rectangle;
    #initialized: boolean = false;
    #layers: BlueprintLayers;
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
            (this.#layers = new BlueprintLayers())
        );

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

    getTrigger(triggerId: string): Trigger | null {
        return this.triggers.get(triggerId) ?? null;
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
        this.stage.on("pointerdown", this.#onPointerDown, this);
    }

    #clear() {
        this.stage.removeAllListeners();
        this.#layers.clear();
    }

    #onPointerDown(event: PIXI.FederatedPointerEvent) {
        if (!R.isIncludedIn(event.button, [0, 2])) return;

        const isSelect = event.button === 0;

        this.#drag = {
            origin: this.#subtractPointFromEvent(event, this.#layers.position),
        };

        if (isSelect) {
            this.#drag.selection = this.#layers.addChild(new PIXI.Graphics());
            this.nodes.clearSelected();
        }

        this.stage.on("pointermove", this.#onPointerMove, this);
        this.stage.on("pointerup", this.#onPointerUp, this);
        this.stage.on("pointerupoutside", this.#onPointerUp, this);
    }

    #onPointerMove(event: PIXI.FederatedPointerEvent) {
        if (!this.#drag) return;

        const { origin, dragging, selection } = this.#drag;

        if (!dragging) {
            const target = this.#subtractPointFromEvent(event, this.#layers.position);
            const distance = distanceToPoint(target, origin);
            if (distance < 10) return;

            this.#drag.dragging = true;
            this.#layers.interactiveChildren = false;

            if (!selection) {
                this.stage.cursor = "grabbing";
            }
        }

        if (selection) {
            const target = this.#subtractPointFromEvent(event, this.#layers.position);
            const width = Math.abs(target.x - origin.x);
            const height = Math.abs(target.y - origin.y);

            selection.x = Math.min(origin.x, target.x);
            selection.y = Math.min(origin.y, target.y);

            selection.clear();
            selection.lineStyle(2, BlueprintNode.SELECTED_COLOR, 0.9);
            selection.drawRect(0, 0, width, height);
        } else {
            const { x, y } = this.#subtractPointFromEvent(event, origin);
            this.setPosition(x, y);
        }
    }

    #onPointerUp(event: PIXI.FederatedPointerEvent) {
        const wasDragging = !!this.#drag?.dragging;
        const selection = this.#drag?.selection;

        this.#drag = null;
        this.#layers.interactiveChildren = true;

        this.stage.cursor = "default";
        this.stage.off("pointermove", this.#onPointerMove, this);
        this.stage.off("pointerup", this.#onPointerUp, this);
        this.stage.off("pointerupoutside", this.#onPointerUp, this);

        if (selection) {
            if (wasDragging) {
                this.nodes.selectNodes(selection);
            }

            this.#layers.removeChild(selection);
            selection.destroy();
        } else if (!wasDragging && this.trigger?.locked === false) {
            this.#openNodesMenu(event.global);
        }
    }

    async #openNodesMenu({ x, y }: Point, entry?: NodeEntry) {
        const source = await BlueprintNodesMenu.wait(this.application, entry);
        if (!source) return;

        const scale = this.scale;
        const position = this.#layers.position;

        source.position = {
            x: x / scale - position.x,
            y: y / scale - position.y,
        };

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
        const mult = event.deltaY < 0 ? 1 : -1;
        this.scale = this.stage.scale.x + 0.1 * mult;
    }

    #subtractPointFromEvent(event: PIXI.FederatedPointerEvent, point: Point): Point {
        return subtractPoint(dividePointBy(event.global, this.scale), point);
    }
}

export { Blueprint };
