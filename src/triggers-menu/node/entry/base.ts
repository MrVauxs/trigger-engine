import { EntryConnections, isOppositeConnection } from "engine";
import { localizePath, R } from "module-helpers";
import { Blueprint } from "triggers-menu";
import { alignHorizontally, BlueprintNode } from "..";

abstract class BaseBlueprintEntry extends PIXI.Container<PIXI.Container> {
    #category: EntryCategory;
    #connector?: PIXI.Graphics;
    #field?: PIXI.Container;
    #label?: PreciseText;
    #parent: BlueprintNode;

    constructor(parent: BlueprintNode, category: EntryCategory) {
        super();

        this.#category = category;
        this.#parent = parent;
    }

    abstract get key(): string;
    abstract get label(): string;
    abstract get color(): ColorSource;
    abstract get canConnect(): boolean;
    abstract get hasConnector(): boolean;
    abstract get isRevealed(): boolean;
    abstract get customSlug(): string | undefined;
    abstract get isConnectionInitiator(): boolean;

    get id(): EntryId {
        return `${this.node.id}:${this.preciseCategory}:${this.key}`;
    }

    get category(): EntryCategory {
        return this.#category;
    }

    get preciseCategory(): PreciseEntryCategory {
        return this.category;
    }

    get oppositeCategory(): EntryCategory {
        return this.isInput ? "outputs" : "inputs";
    }

    get oppositePreciseCategory(): PreciseEntryCategory {
        return this.oppositeCategory;
    }

    get node(): BlueprintNode {
        return this.#parent;
    }

    get blueprint(): Blueprint {
        return this.node.blueprint;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get isCustom(): boolean {
        return this.isRevealed || !!this.customSlug;
    }

    get isConnected(): boolean {
        return this.node.trigger.entryIsConnected(this.id);
    }

    get isInput(): boolean {
        return this.#category === "inputs";
    }

    get isOutput(): boolean {
        return !this.isInput;
    }

    get maxHeight(): number {
        return this.node.entryHeight - this.node.rowSpacing;
    }

    get connectorWidth(): number {
        return 16;
    }

    get connectorCenter(): Point {
        if (!this.#connector) {
            return { x: 0, y: 0 };
        }

        const bounds = this.#connector.getBounds();

        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        };
    }

    get connectorOffset(): Point {
        if (!this.#connector) {
            return { x: 0, y: 0 };
        }

        const center = this.connectorCenter;
        const bounds = this.node.getBounds();

        return {
            x: center.x - bounds.x,
            y: center.y - bounds.y,
        };
    }

    get connections(): EntryConnections {
        const key = this.key;
        const category = this.preciseCategory;

        return (isOppositeConnection(category) && this.node.data[category][key]?.connections) || {};
    }

    abstract _drawConnector(connector: PIXI.Graphics, isConnected: boolean): void;
    abstract _drawField(label: PreciseText): PIXI.Graphics | null;

    draw() {
        this.#clear();

        this.#connector = this.#drawConnector();
        this.#label = this.#drawLabel();
        this.#field = this._drawField(this.#label) || undefined;

        const content = [
            this.#connector,
            // if the label has been added to the field, we don't want to move it back at top level
            this.#label.parent ? undefined : this.#label,
            this.#field,
        ];

        alignHorizontally(this, content, {
            height: this.node.entryHeight,
            reverse: this.isOutput,
            spacing: 5,
        });
    }

    redrawConnector(isConnected: boolean) {
        const connector = this.#connector;
        if (!connector) return;

        connector.clear();
        this._drawConnector(connector, isConnected);
    }

    canConnectTo(other: BaseBlueprintEntry) {
        return (
            this.hasConnector &&
            this.canConnect &&
            this.preciseCategory === other.oppositePreciseCategory
        );
    }

    disconnect() {
        const category = this.preciseCategory;

        if (this.isInput) {
            for (const otherId of R.keys(this.connections)) {
                this.node.removeConnection(category, this.key, otherId);
            }
        } else {
            const entryId = this.id;

            for (const twoWays of this.node.trigger.linkedConnections) {
                const [originId, targetId] = R.split(twoWays, "-");
                const otherId =
                    originId === entryId ? targetId : targetId === entryId ? originId : undefined;
                const otherEntry = otherId && this.blueprint.nodes.getEntryFromId(otherId);
                if (!otherEntry) continue;

                otherEntry.node.removeConnection(
                    otherEntry.preciseCategory,
                    otherEntry.key,
                    entryId
                );
            }
        }

        this.blueprint.draw({ forceComputeConnections: true });
    }

    remove() {
        const category = this.preciseCategory;
        if (!this.isCustom || category === "ins") return;

        // TODO also remove variables

        if (this.isRevealed) {
            this.node.data.update({
                revealed: {
                    [category]: {
                        [this.key]: undefined,
                    },
                },
            });
        } else {
            const slug = this.customSlug;
            if (!slug) return;

            this.node.data.update({
                custom: {
                    [category]: {
                        [slug]: undefined,
                    },
                },
            });
        }

        this.node.refresh({ forceComputeConnections: true });
    }

    #clear() {
        this.removeChildren();

        this.#connector?.destroy(true);
        this.#label?.destroy(true);
        this.#field?.destroy(true);

        this.#connector = undefined;
        this.#label = undefined;
        this.#field = undefined;
    }

    #drawConnector(): PIXI.Graphics | undefined {
        if (!this.hasConnector) return;

        const connector = new PIXI.Graphics();

        this._drawConnector(connector, this.isConnected);

        connector.width = this.connectorWidth;
        connector.eventMode = "static";
        connector.hitArea = new PIXI.Rectangle(0, 0, this.connectorWidth, this.maxHeight);

        if (this.canConnect) {
            connector.cursor = "alias";
            connector.on("pointerdown", this.#onConnectorPointerDown, this);
        } else {
            connector.on("pointerdown", (event) => event.stopPropagation(), this);
        }

        connector.on("pointerup", this.#onConnectorPointerUp, this);

        return connector;
    }

    #drawLabel(): PreciseText {
        return this.node.preciseText(this.label, {
            lineHeight: this.node.entryHeight,
        });
    }

    #onConnectorPointerDown(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();

        if (event.button === 0) {
            this.blueprint.connections.start(event, this);
        }
    }

    #onConnectorPointerUp(event: PIXI.FederatedPointerEvent) {
        if (event.button !== 2) return;
        if (this.node.isLocked) return;

        const entries: Omit<ContextMenuEntry, "condition">[] = [];

        if (this.isConnected) {
            entries.push({
                name: localizePath("blueprint.entry.disconnect"),
                icon: `<i class="fa-solid fa-link-horizontal-slash"></i>`,
                callback: async () => {
                    this.disconnect();
                },
            });
        }

        if (this.isCustom || this.isRevealed) {
            entries.push({
                name: localizePath("blueprint.entry.remove"),
                icon: `<i class="fa-solid fa-trash fa-fw"></i>`,
                callback: async () => {
                    this.remove();
                },
            });
        }

        this.node.createContextMenu(event, entries);
    }
}

type EntryCategory = "inputs" | "outputs";

type PreciseEntryCategory = "inputs" | "outputs" | "ins" | "outs";

type EntryId = `${string}:${PreciseEntryCategory}:${string}`;

export { BaseBlueprintEntry };
export type { EntryCategory, EntryId, PreciseEntryCategory };
