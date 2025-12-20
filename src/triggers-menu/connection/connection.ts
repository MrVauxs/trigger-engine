import { calculateMidPoint } from "module-helpers";
import { BaseBlueprintEntry, BlueprintEntry, EntryId } from "triggers-menu";
import { BlueprintConnectionsLayer } from ".";

class BlueprintConnection extends PIXI.Graphics {
    #converter?: PIXI.Graphics;
    #origin: EntryId;
    #target: EntryId;

    constructor(origin: BaseBlueprintEntry, target: BaseBlueprintEntry) {
        super();

        this.#origin = origin.id;
        this.#target = target.id;
    }

    hasEntry(entry: BaseBlueprintEntry): boolean {
        const entryId = entry.id;
        return this.#origin === entryId || this.#target === entryId;
    }

    draw() {
        this.clear();

        const origin = this.parent.blueprint.nodes.getEntryFromId(this.#origin);
        const target = this.parent.blueprint.nodes.getEntryFromId(this.#target);
        if (!origin || !target) return;

        const originCenter = this.parent.fromPoint(origin.connectorCenter);
        const targetCenter = this.parent.fromPoint(target.connectorCenter);

        const halfPoint = drawCurvedLine(this, originCenter, targetCenter, [
            origin.color,
            target.color,
        ]);

        // we don't need a converter
        if (!(origin instanceof BlueprintEntry) || origin.type === (target as BlueprintEntry).type)
            return;

        const converter = (this.#converter ??= (() => {
            const padding = { x: 4, y: 2 };
            const converter = new PIXI.Graphics();
            const icon = origin.node.fontAwesomeIcon({ unicode: "\uf0ec" });

            const width = icon.width + padding.x * 2;
            const height = icon.height + padding.y * 2;

            icon.position.set(padding.x, padding.y);

            converter.beginFill(0x0, 0.5);
            converter.lineStyle({ color: 0x0, width: 2, alpha: 0.8 });
            converter.drawRoundedRect(0, 0, width, height, 4);
            converter.endFill();

            converter.addChild(icon);

            return converter;
        })());

        converter.position.set(
            halfPoint.x - converter.width / 2,
            halfPoint.y - converter.height / 2
        );

        this.addChild(converter);
    }
}

/**
 * @returns halfPoint between origin & target
 */
function drawCurvedLine(
    graphics: PIXI.Graphics,
    origin: Point,
    target: Point,
    colors: [ColorSource] | [ColorSource, ColorSource]
): Point {
    const halfPoint = calculateMidPoint(origin, target);

    graphics.moveTo(origin.x, origin.y);
    graphics.lineStyle(6, colors.at(0), 1, 0.5);
    graphics.quadraticCurveTo((origin.x + halfPoint.x) / 2, origin.y, halfPoint.x, halfPoint.y);
    graphics.lineStyle(6, colors.at(-1), 1, 0.5);
    graphics.quadraticCurveTo((halfPoint.x + target.x) / 2, target.y, target.x, target.y);

    return halfPoint;
}

interface BlueprintConnection {
    parent: BlueprintConnectionsLayer;
}

export { BlueprintConnection, drawCurvedLine };
