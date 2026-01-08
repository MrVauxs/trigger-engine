import { drawRectangleMask, LocalizeArgs, R } from "module-helpers";
import { BlueprintNode, NodeFieldOptions } from "triggers-menu";
import { NodeField } from ".";
import { NodeEntry } from "..";

function instantiateField(
    FieldCls: typeof NodeField,
    parent: NodeEntry,
    node: BlueprintNode,
    options: NodeFieldOptions,
) {
    function localize(...args: LocalizeArgs): string | undefined {
        return node.localize(...args);
    }

    class EntryFieldWrapper extends FieldCls {
        constructor() {
            super();

            Object.defineProperty(this, "entry", {
                value: parent,
                configurable: false,
                enumerable: false,
                writable: false,
            });

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
                }),
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
                    }),
                ),
            );

            // from private methods
            Object.defineProperties(
                this,
                R.pipe(
                    [
                        ["addRectangleMask", this.#addRectangleMask],
                        ["getGlobalBounds", this.#getGlobalBounds],
                        ["localize", localize],
                    ] as const,
                    R.fromEntries(),
                    R.mapValues((method) => {
                        return {
                            value: method.bind(this),
                            configurable: false,
                            enumerable: false,
                            writable: false,
                        };
                    }),
                ),
            );
        }

        #addRectangleMask(
            parent: PIXI.Container,
            x: number,
            y: number,
            width: number,
            height: number,
            radius?: number | undefined,
        ) {
            const mask = drawRectangleMask(x, y, width, height, radius);

            parent.addChild(mask);
            parent.mask = mask;
        }

        #getGlobalBounds(): PIXI.Rectangle {
            return node.blueprint.getGlobalBounds(this);
        }
    }

    return new EntryFieldWrapper();
}

export { instantiateField };
