import { alignHorizontally, BlueprintNode } from "..";

abstract class BaseBlueprintEntry extends PIXI.Container<PIXI.Container> {
    #category: EntryCategory;
    #connector: PIXI.Graphics = new PIXI.Graphics();
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

    abstract _drawConnector(connector: PIXI.Graphics): void;

    draw() {
        this.#connector.clear();
        if (this.isConnected) {
            this.#connector.beginFill(this.color);
        }
        this._drawConnector(this.#connector);
        this.#connector.endFill();

        const content = [
            this.#connector,
            (this.#label = this.node.preciseText(this.label)),
            (this.#field = this.#drawField()),
        ];

        alignHorizontally(this, content, {
            height: this.node.entryHeight,
            reverse: this.isOutput,
            spacing: 5,
        });
    }

    #drawField(): PIXI.Container | undefined {
        return;
    }
}

type EntryCategory = "inputs" | "outputs";

export { BaseBlueprintEntry };
export type { EntryCategory };
