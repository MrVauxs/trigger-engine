import { GridSnappingBehavior, RegionSource } from "foundry-helpers";

function moveRegionToPosition(
    region: RegionDocument,
    pointOrToken: TokenDocument | Point,
): RegionSource["shapes"] | undefined {
    const shapes = foundry.utils.deepClone(region._source.shapes);
    const shape = shapes.at(0);
    if (!shape) return;

    const token = pointOrToken instanceof TokenDocument ? pointOrToken : null;

    if ("base" in shape) {
        const coords = token?.movement.destination ?? pointOrToken;
        const { x, y } = getSnappedCoords(region, coords, CONST.GRID_SNAPPING_MODES.TOP_LEFT_CORNER);
        const base = shape.base as Point;

        base.x = x;
        base.y = y;
    } else if ("x" in shape) {
        const { x, y } = token
            ? getTokenCenter(region, token)
            : getSnappedCoords(region, pointOrToken, CONST.GRID_SNAPPING_MODES.CENTER);

        shape.x = x;
        shape.y = y;
    }

    return shapes;
}

// we do all that because the default TokenDocument don't have the pf2e goodies
function getTokenCenter(region: RegionDocument, token: TokenDocument) {
    const mode = CONST.GRID_SNAPPING_MODES.CENTER;
    const { x, y } = getSnappedCoords(region, token.movement.destination, mode);
    const gridSize = token.parent?.grid.size ?? 100;
    const bounds = new PIXI.Rectangle(x, y, token.width * gridSize, token.height * gridSize);

    return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
    };
}

function getSnappedCoords(region: RegionDocument, coords: Point, mode: GridSnappingBehavior["mode"]) {
    return region.parent?.grid.getSnappedPoint(coords, { mode }) ?? coords;
}

export { moveRegionToPosition };
