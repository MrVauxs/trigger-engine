import { NodeBridge } from "engine";
import { localize } from "module-helpers";
import { BaseBlueprintEntry, EntryCategory, PreciseEntryCategory } from ".";
import { BlueprintNode } from "..";

class BlueprintBridgeEntry extends BaseBlueprintEntry {
    #data: NodeBridge;

    constructor(parent: BlueprintNode, category: EntryCategory, data: NodeBridge) {
        super(parent, category);

        this.#data = data;
    }

    get preciseCategory(): PreciseEntryCategory {
        return this.isInput ? "ins" : "outs";
    }

    get oppositePreciseCategory(): PreciseEntryCategory {
        return this.isInput ? "outs" : "ins";
    }

    get key(): string {
        return this.#data.key;
    }

    get label(): string {
        const { key, label } = this.#data;

        if (label) {
            return game.i18n.localize(label);
        }

        if (this.isInput) {
            return this.node.localize("in") ?? localize("node.in");
        }

        return (
            this.node.localize("out", key) ?? //
            (key === "out" ? localize("node.out") : key)
        );
    }

    get color(): ColorSource {
        return 0xffffff;
    }

    get hasConnector(): boolean {
        return true;
    }

    get canConnect(): boolean {
        return this.isInput || !this.isConnected;
    }

    _drawConnector(connector: PIXI.Graphics, isConnected: boolean) {
        const color = this.color;

        if (isConnected) {
            connector.beginFill(color);
        }

        connector.lineStyle({ color, width: 1.5 });
        connector.moveTo(0, 0);
        connector.lineTo(6, 0);
        connector.lineTo(11.5, 6.25);
        connector.lineTo(6, 12.5);
        connector.lineTo(0, 12.5);
        connector.lineTo(0, 0);

        connector.endFill();
    }

    _drawField(): null {
        return null;
    }
}

export { BlueprintBridgeEntry };
