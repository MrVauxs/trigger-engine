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

    get node() {
        return this.#parent;
    }

    get isConnected(): boolean {
        return false;
    }

    get isInput() {
        return this.#category === "inputs";
    }

    get isOutput() {
        return !this.isInput;
    }

    abstract _drawConnector(): PIXI.Graphics | null;
    abstract _drawField(label: PreciseText): PIXI.Graphics | null;

    draw() {
        this.#clear();

        this.#connector = this._drawConnector() || undefined;
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

    #drawLabel(): PreciseText {
        return this.node.preciseText(this.label, {
            lineHeight: this.node.entryHeight,
        });
    }
}

type EntryCategory = "inputs" | "outputs";

export { BaseBlueprintEntry };
export type { EntryCategory };
