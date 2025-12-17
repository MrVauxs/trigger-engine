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

    get node() {
        return this.#parent;
    }

    get isConnected(): boolean {
        return false;
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

    abstract _drawConnector(): PIXI.Graphics | null;
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

        const connector = this._drawConnector();

        if (!connector || !this.canConnect) {
            return connector ?? undefined;
        }

        connector.width = this.connectorWidth;
        connector.cursor = "alias";
        connector.eventMode = "static";
        connector.hitArea = new PIXI.Rectangle(0, 0, this.connectorWidth, this.maxHeight);

        return connector;
    }

    #drawLabel(): PreciseText {
        return this.node.preciseText(this.label, {
            lineHeight: this.node.entryHeight,
        });
    }
}

type EntryCategory = "inputs" | "outputs";

export { BaseBlueprintEntry };
export type { EntryCategory };
