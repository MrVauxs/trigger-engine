import { NodeEntry } from "engine";
import { BaseBlueprintEntry } from ".";
import { BlueprintNode } from "..";

class BlueprintEntry extends BaseBlueprintEntry {
    #entry: NodeEntry;

    constructor(parent: BlueprintNode, entry: NodeEntry) {
        super(parent, entry.category);

        this.#entry = entry;
    }

    get key(): string {
        return this.#entry.key;
    }

    get label(): string {
        const { key, label } = this.#entry;
        return label ? game.i18n.localize(label) : this.node.localize("entry", key) ?? key;
    }

    get isCustom(): boolean {
        return false;
    }

    get color(): ColorSource {
        return this.#entry.color;
    }

    _drawConnector(connector: PIXI.Graphics): void {
        const color = this.color;

        if (this.isCustom) {
            connector.lineStyle({ color, width: 2 });
            connector.drawRoundedRect(0, 0, 12.5, 12.5, 2.5);
        } else {
            connector.lineStyle({ color, width: 2 });
            connector.drawCircle(7, 7, 6.5);
        }
    }

    _drawField(label: PreciseText): PIXI.Graphics | null {
        return this.isInput ? this.#entry.createFieldElement(label, this.node.entryHeight) : null;
    }
}

export { BlueprintEntry };
