import {
    ConnectionId,
    EntryCategory,
    EntryId,
    isGateEntryNode,
    isGateExitNode,
    OpenTrigger,
    PreciseEntryCategory,
} from "engine";
import { confirmDialog, localizePath, R } from "module-helpers";
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

    abstract get canConnect(): boolean;
    abstract get color(): ColorSource;
    abstract get connection(): ConnectionId | undefined;
    abstract get customSlug(): string | undefined;
    abstract get hasConnector(): boolean;
    abstract get isConnectionInitiator(): boolean;
    abstract get key(): string;
    abstract get label(): string;

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

    get trigger(): OpenTrigger {
        return this.node.trigger;
    }

    get blueprint(): Blueprint {
        return this.node.blueprint;
    }

    get stage(): PIXI.Container {
        return this.blueprint.stage;
    }

    get isCustom(): boolean {
        return !!this.customSlug;
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

        this.eventMode = "static";
        this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);
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
            this.preciseCategory === other.oppositePreciseCategory &&
            // we don't want gates looping over each other, this is an easy exception to make
            (!this.node.isGate || !other.node.isGate || this.node.gateId !== other.node.gateId)
        );
    }

    disconnect() {
        const category = this.preciseCategory;

        if (this.isConnectionInitiator) {
            const connection = this.connection;
            if (!connection) return;

            this.node.removeConnection(category, this.key, connection);
        } else {
            const entryId = this.id;

            for (const twoWays of this.node.trigger.linkedConnections) {
                const [originId, targetId] = R.split(twoWays, "-");
                const otherId = originId === entryId ? targetId : targetId === entryId ? originId : undefined;
                const otherEntry = otherId && this.blueprint.nodes.getEntryFromId(otherId);
                if (!otherEntry) continue;

                otherEntry.node.removeConnection(otherEntry.preciseCategory, otherEntry.key, entryId);
            }
        }

        this.blueprint.draw({ forceComputeConnections: true });
    }

    async remove() {
        const preciseCategory = this.preciseCategory;
        if (!this.isCustom || preciseCategory === "ins") return;

        const nodes: (readonly [PreciseEntryCategory, BlueprintNode])[] = [[preciseCategory, this.node]];

        // we want to disconnect all the entry-gates too
        if (isGateExitNode(this.node)) {
            const oppositeCategory = this.oppositePreciseCategory;

            nodes.push(
                ...this.node.parent.getGateEntries(this.node.id).map((node) => [oppositeCategory, node] as const),
            );
        }

        for (const [category, node] of nodes) {
            node.data.update({
                custom: {
                    [category]: {
                        [this.key]: undefined,
                    },
                },
            });
        }

        // we remove the variable if any (and all the getters)
        this.blueprint.deleteVariable(this.id as ConnectionId, false);

        this.node.refresh({
            forceComputeConnections: true,
            renderApplication: true,
        });
    }

    _contextMenuOptions(): ContextMenuEntry[] {
        return [
            {
                name: localizePath("blueprint.entry.disconnect"),
                icon: `<i class="fa-solid fa-link-horizontal-slash"></i>`,
                condition: this.isConnected,
                callback: async () => {
                    this.disconnect();
                },
            },
            {
                name: localizePath("blueprint.entry.remove.title"),
                icon: `<i class="fa-solid fa-trash fa-fw"></i>`,
                condition: this.isCustom && !isGateEntryNode(this.node),
                callback: async () => {
                    const confirm = await confirmDialog("blueprint.entry.remove");
                    return confirm && this.remove();
                },
            },
        ];
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

        const entries: ContextMenuEntry[] = this._contextMenuOptions();
        this.node.createContextMenu(event, entries);
    }
}

export { BaseBlueprintEntry };
export type { EntryCategory };
