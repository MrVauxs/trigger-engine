import { Blueprint } from ".";

class BlueprintGridLayer extends PIXI.TilingSprite {
    static GRID_SIZE = 16;
    static TEXTURE_SIZE = BlueprintGridLayer.GRID_SIZE * 10;

    constructor(parent: Blueprint) {
        const renderTexture = PIXI.RenderTexture.create({
            width: BlueprintGridLayer.TEXTURE_SIZE,
            height: BlueprintGridLayer.TEXTURE_SIZE,
            resolution: window.devicePixelRatio,
        });

        super(renderTexture);

        const grid = this.#createGrid();

        parent.renderer.render(grid, { renderTexture: this.texture });
    }

    #createGrid(): PIXI.Graphics {
        const grid = new PIXI.Graphics();

        for (let i = 0; i <= 10; i++) {
            const size = BlueprintGridLayer.GRID_SIZE * i;
            const color = i === 0 || i === 10 ? 0x000000 : 0x808080;

            grid.lineStyle(1, color, 0.2, 1);

            grid.moveTo(0, size);
            grid.lineTo(BlueprintGridLayer.TEXTURE_SIZE, size);

            grid.moveTo(size, 0);
            grid.lineTo(size, BlueprintGridLayer.TEXTURE_SIZE);
        }

        return grid;
    }
}

interface BlueprintGridLayer extends PIXI.TilingSprite {
    get texture(): PIXI.RenderTexture;
}

export { BlueprintGridLayer };
