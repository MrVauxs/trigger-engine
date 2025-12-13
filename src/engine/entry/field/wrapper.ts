import { drawRectangleMask, R } from "module-helpers";
import { BlueprintNode, NodeFieldOptions } from "triggers-menu";
import { NodeField } from ".";

function instantiateField(
    FieldCls: typeof NodeField,
    node: BlueprintNode,
    options: NodeFieldOptions
) {
    class EntryFieldWrapper extends FieldCls {
        constructor() {
            super();

            // from options
            Object.defineProperties(
                this,
                R.fromKeys(R.keys(options), (property) => {
                    return {
                        value: options[property],
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    };
                })
            );

            // from BlueprintNode methods
            Object.defineProperties(
                this,
                R.pipe(
                    [
                        ["createFontAwesomeIcon", node.fontAwesomeIcon],
                        ["createPreciseText", node.preciseText],
                    ] as const,
                    R.fromEntries(),
                    R.mapValues((method) => {
                        return {
                            value: method.bind(node),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        };
                    })
                )
            );

            // from private methods
            Object.defineProperties(
                this,
                R.pipe(
                    [
                        ["addRectangleMask", this.#addRectangleMask],
                        ["getGlobalBounds", this.#getGlobalBounds],
                    ] as const,
                    R.fromEntries(),
                    R.mapValues((method) => {
                        return {
                            value: method.bind(this),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        };
                    })
                )
            );
        }

        #addRectangleMask(
            parent: PIXI.Container,
            x: number,
            y: number,
            width: number,
            height: number,
            radius?: number | undefined
        ) {
            const mask = drawRectangleMask(x, y, width, height, radius);

            parent.addChild(mask);
            parent.mask = mask;
        }

        #getGlobalBounds(): PIXI.Rectangle {
            const scale = node.stage.scale;
            const position = this.getGlobalPosition();
            const viewBounds = node.blueprint.view.getBoundingClientRect();

            const x = position.x + viewBounds.x;
            const y = position.y + viewBounds.y;
            const width = this.width * scale.x;
            const height = this.height * scale.y;

            return new PIXI.Rectangle(x, y, width, height);
        }
    }

    interface EntryFieldWrapper {
        draw(): void;
        onClick(): Promise<unknown>;
    }

    return new EntryFieldWrapper();
}

export { instantiateField };
